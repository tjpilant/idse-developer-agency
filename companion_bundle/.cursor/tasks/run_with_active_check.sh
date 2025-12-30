#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Auto-load LLM_ID from .env if not set
if [[ -z "${LLM_ID:-}" ]] && [[ -f "${ROOT_DIR}/.env" ]]; then
  export $(grep -v '^#' "${ROOT_DIR}/.env" | grep 'LLM_ID=' | xargs)
fi

if [[ -z "${LLM_ID:-}" ]]; then
  echo "❌ LLM_ID environment variable is required (claude_code | codex_gpt)." >&2
  echo "   Set it in .env or export LLM_ID=claude_code" >&2
  exit 1
fi

echo "Checking active LLM (LLM_ID=${LLM_ID})..."
python3 "${ROOT_DIR}/.cursor/tasks/governance.py" check-active --as "${LLM_ID}" --quiet

echo "✓ Active LLM confirmed; running command: $*"
exec "$@"
