from __future__ import annotations

import os
import uuid
from datetime import datetime
from enum import Enum

from dotenv import load_dotenv
from sqlalchemy import DateTime, Enum as SqlEnum, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncEngine, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

load_dotenv()

def normalized_database_url(value: str) -> str:
    if value.startswith("jdbc:postgresql://"):
        return "postgresql+asyncpg://" + value.removeprefix("jdbc:postgresql://")
    if value.startswith("postgresql://"):
        return "postgresql+asyncpg://" + value.removeprefix("postgresql://")
    return value


DATABASE_URL = normalized_database_url(os.getenv("DATABASE_URL", "postgresql+asyncpg://acots:acots@localhost:5432/acots"))


class Base(AsyncAttrs, DeclarativeBase):
    pass


class ApplicationStatus(str, Enum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    INTERVIEWING = "INTERVIEWING"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class QuestionCategory(str, Enum):
    TECHNICAL = "TECHNICAL"
    BEHAVIORAL = "BEHAVIORAL"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company: Mapped[str] = mapped_column(String(160), nullable=False)
    role: Mapped[str] = mapped_column(String(160), nullable=False)
    date_applied: Mapped[datetime | None] = mapped_column(nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(SqlEnum(ApplicationStatus, name="application_status"), default=ApplicationStatus.SAVED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    resume_text: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, nullable=False)
    skill_gaps: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    optimization_suggestions: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_pattern: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[QuestionCategory] = mapped_column(SqlEnum(QuestionCategory, name="question_category"), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def initialize_database() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        # The project previously used a resume_analyses schema containing these
        # fields. Keep startup compatible with both an existing Docker volume
        # and a fresh database without requiring users to delete their data.
        await connection.execute(text("ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS resume_text TEXT"))
        await connection.execute(text("ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS file_size_bytes INTEGER"))


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
