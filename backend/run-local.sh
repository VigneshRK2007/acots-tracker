#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

exec .venv/bin/uvicorn main:app --reload --port 8000
