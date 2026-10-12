#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

if [[ -f .env ]]; then
  # A locally installed PostgreSQL server commonly owns host port 5432.
  # Migrate only the old ACOTS Docker URL; custom database URLs are untouched.
  if grep -q '^DATABASE_URL=postgresql+asyncpg://acots:acots@localhost:5432/acots$' .env; then
    sed -i 's|^DATABASE_URL=postgresql+asyncpg://acots:acots@localhost:5432/acots$|DATABASE_URL=postgresql+asyncpg://acots:acots@localhost:5433/acots|' .env
    echo "Updated ACOTS DATABASE_URL to localhost:5433 to avoid a local PostgreSQL port conflict."
  fi
  set -a
  source .env
  set +a
fi

docker compose -f "$project_root/docker-compose.yml" up -d postgres

exec .venv/bin/uvicorn main:app --reload --port 8000
