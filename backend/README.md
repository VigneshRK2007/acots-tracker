# ACOTS FastAPI Backend

This service accepts a PDF resume and job description, extracts resume text with `pdfplumber`, asks Gemini for structured ATS output, and persists each response in PostgreSQL.

## Setup

From the project root, start PostgreSQL:

```bash
docker compose up -d postgres
```

Create a Python virtual environment and install the backend dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

If you are reusing a `.env` from the former Spring service, replace its `DATABASE_URL` value with the async SQLAlchemy format shown in `.env.example`.

This project maps the Docker database to port `5433` on the host to avoid a conflict with a locally installed PostgreSQL service that often occupies port `5432`.

Set a valid `GEMINI_API_KEY` in `.env`, then start the API:

```bash
uvicorn main:app --reload --port 8000
```

The API permits browser requests from `http://localhost:5173`.

## Endpoints

- `POST /api/analyze` — multipart form fields: `file` (PDF) and `jobDescription`
- `GET /api/latest` — retrieves the latest persisted analysis
- `GET /api/applications` — retrieves the application tracker entries
- `POST /api/applications` — creates a tracker entry with `company`, `role`, `dateApplied`, and `status`
- `PUT /api/applications/{id}/status` — updates one application status
- `GET /api/interviews/questions?applicationId={id}` — returns role-aware technical and behavioral preparation questions

The ATS analysis endpoints return this JSON contract:

```json
{
  "atsScore": 0,
  "skillGaps": [],
  "optimizationSuggestions": []
}
```

The application endpoints persist their state in the same PostgreSQL database. The dashboard combines this application pipeline with the latest ATS analysis; it does not use frontend mock data.
