CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE application_status AS ENUM (
    'SAVED',
    'APPLIED',
    'INTERVIEWING',
    'OFFER',
    'REJECTED'
);

CREATE TYPE interview_question_category AS ENUM (
    'TECHNICAL',
    'BEHAVIORAL'
);

CREATE TYPE question_difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company VARCHAR(160) NOT NULL,
    role VARCHAR(160) NOT NULL,
    date_applied DATE,
    status application_status NOT NULL DEFAULT 'SAVED',
    ats_score SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applications_company_not_blank CHECK (btrim(company) <> ''),
    CONSTRAINT applications_role_not_blank CHECK (btrim(role) <> ''),
    CONSTRAINT applications_ats_score_range CHECK (ats_score IS NULL OR ats_score BETWEEN 0 AND 100)
);

CREATE INDEX applications_status_date_applied_idx
    ON applications (status, date_applied DESC NULLS LAST);

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER applications_set_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(120),
    file_size_bytes BIGINT NOT NULL,
    job_description TEXT NOT NULL,
    ats_score SMALLINT NOT NULL,
    improvements JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resume_analyses_filename_not_blank CHECK (btrim(original_filename) <> ''),
    CONSTRAINT resume_analyses_job_description_not_blank CHECK (btrim(job_description) <> ''),
    CONSTRAINT resume_analyses_file_size_non_negative CHECK (file_size_bytes >= 0),
    CONSTRAINT resume_analyses_ats_score_range CHECK (ats_score BETWEEN 0 AND 100),
    CONSTRAINT resume_analyses_improvements_array CHECK (jsonb_typeof(improvements) = 'array')
);

CREATE INDEX resume_analyses_created_at_idx
    ON resume_analyses (created_at DESC);

CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_pattern VARCHAR(160) NOT NULL,
    category interview_question_category NOT NULL,
    question TEXT NOT NULL,
    difficulty question_difficulty NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT interview_questions_role_pattern_not_blank CHECK (btrim(role_pattern) <> ''),
    CONSTRAINT interview_questions_question_not_blank CHECK (btrim(question) <> '')
);

CREATE INDEX interview_questions_role_pattern_idx
    ON interview_questions (role_pattern);
