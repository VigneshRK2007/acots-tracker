from __future__ import annotations

import json
import logging
import os
import re
import asyncio
from contextlib import asynccontextmanager
from io import BytesIO
from typing import Annotated

import google.generativeai as genai
import pdfplumber
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import DeadlineExceeded, ServiceUnavailable
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import ResumeAnalysis, get_session, initialize_database

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Gemini 1.5 Flash was retired. Flash-Lite is fast and sufficient for this
# small, structured ATS analysis response.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_RESUME_CHARACTERS = 15_000
MAX_JOB_DESCRIPTION_CHARACTERS = 15_000
logger = logging.getLogger(__name__)


class AnalysisResponse(BaseModel):
    atsScore: int = Field(ge=0, le=100)
    skillGaps: list[str]
    optimizationSuggestions: list[str]

    @field_validator("skillGaps", "optimizationSuggestions")
    @classmethod
    def strings_only(cls, values: list[str]) -> list[str]:
        if any(not isinstance(value, str) or not value.strip() for value in values):
            raise ValueError("Each item must be a non-empty string")
        return [value.strip() for value in values]


@asynccontextmanager
async def lifespan(_: FastAPI):
    await initialize_database()
    yield


app = FastAPI(title="ACOTS API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The uploaded file is not a readable PDF") from exception
    if not text.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The PDF has no extractable text")
    # Very large resumes increase latency without improving an ATS comparison.
    return text[:MAX_RESUME_CHARACTERS]


def strip_markdown_fences(value: str) -> str:
    value = value.strip()
    value = re.sub(r"^```(?:json)?\s*", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\s*```$", "", value)
    return value.strip()


def provider_error_detail(exception: Exception) -> str:
    """Return a useful client-safe Gemini error without ever exposing credentials."""
    message = " ".join(str(exception).split())
    if not message:
        return "Gemini returned an empty response. Please try again."
    # Provider exception text never needs to be arbitrarily long in an HTTP response.
    return f"Gemini request failed: {message[:500]}"


def analyze_with_gemini(resume_text: str, job_description: str) -> AnalysisResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GEMINI_API_KEY is not configured")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)
    prompt = f"""
You are an ATS evaluator. Compare the resume to the job description.
Return exactly one JSON object with these keys:
- atsScore: integer from 0 through 100
- skillGaps: list of technologies or keywords requested by the job description but absent from the resume
- optimizationSuggestions: list of concrete, distinct resume improvements

Resume:
{resume_text}

Job description:
{job_description}
""".strip()
    try:
        response = None
        for attempt in range(2):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={"temperature": 0, "response_mime_type": "application/json"},
                    request_options={"timeout": 45},
                )
                break
            except (DeadlineExceeded, ServiceUnavailable):
                if attempt == 1:
                    raise
                logger.warning("Gemini request timed out; retrying once with model %s", GEMINI_MODEL)
        if response is None:
            raise ValueError("Gemini did not return a response")
        response_text = strip_markdown_fences(response.text)
        if not response_text:
            raise ValueError("Gemini returned an empty response")
        payload = json.loads(response_text)
        return AnalysisResponse.model_validate(payload)
    except HTTPException:
        raise
    except Exception as exception:
        logger.exception("Gemini ATS analysis failed using model %s", GEMINI_MODEL)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=provider_error_detail(exception),
        ) from exception


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    file: Annotated[UploadFile, File(...)],
    jobDescription: Annotated[str, Form(...)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AnalysisResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only PDF resumes are supported")
    if not jobDescription.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="jobDescription is required")
    if len(jobDescription) > MAX_JOB_DESCRIPTION_CHARACTERS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"jobDescription must be at most {MAX_JOB_DESCRIPTION_CHARACTERS:,} characters",
        )
    file_bytes = await file.read()
    if not file_bytes or len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="The resume must be between 1 byte and 5 MB")
    resume_text = extract_pdf_text(file_bytes)
    result = await asyncio.to_thread(analyze_with_gemini, resume_text, jobDescription.strip())
    session.add(ResumeAnalysis(
        original_filename=file.filename or "resume.pdf",
        resume_text=resume_text,
        file_size_bytes=len(file_bytes),
        job_description=jobDescription.strip(),
        ats_score=result.atsScore,
        skill_gaps=result.skillGaps,
        optimization_suggestions=result.optimizationSuggestions,
    ))
    await session.commit()
    return result


@app.get("/api/latest", response_model=AnalysisResponse)
async def latest_analysis(session: Annotated[AsyncSession, Depends(get_session)]) -> AnalysisResponse:
    analysis = (await session.execute(select(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(1))).scalar_one_or_none()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis exists yet")
    return AnalysisResponse(
        atsScore=analysis.ats_score,
        skillGaps=analysis.skill_gaps,
        optimizationSuggestions=analysis.optimization_suggestions,
    )
