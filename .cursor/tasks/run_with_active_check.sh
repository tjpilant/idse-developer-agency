#!/usr/bin/env bash
set -euo pipefail

# Auto-load LLM_ID from .env if not already set
if [ -z "${LLM_ID:-}" ] && [ -f ".env" ]; then
  # shellcheck disable=SC2046
  export $(grep -E '^LLM_ID=' .env | xargs || true)
fi

if [ -z "${LLM_ID:-}" ]; then
  echo "❌ LLM_ID is not set. Export LLM_ID or add LLM_ID to .env." >&2
  exit 1
fi

python3 .cursor/tasks/governance.py check-active --as "$LLM_ID" --warn-only >/dev/null
python3 "$@"
