#!/usr/bin/env bash
# IDSE Governance Layer Validation Script
# Ensures governance integrity, guardrails, and session-aware checks.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PYTHON="${PYTHON:-python3}"
export PYTHONPATH="$ROOT:${PYTHONPATH:-}"

log() { printf "%s\n" "$*"; }
warn() { printf "⚠ %s\n" "$*" >&2; }

log "🔍 Validating IDSE Governance Layer..."

# Core file checks
log "✓ Checking governance markers and config..."
for f in ".idse-layer" ".cursor/config/idse-governance.json" "idse-governance/state/state.json"; do
  if [ ! -f "$f" ]; then
    echo "✗ Missing required file: $f" >&2
    exit 1
  fi
done

# Governance artifacts stay out of protected paths
VIOLATIONS=0
for path in "src/" "lib/" "app/" "idse_developer_agent/" "implementation/"; do
  if [ -d "$path" ]; then
    if grep -R "handoff_protocol\|GOVERNANCE LAYER" "$path" >/dev/null 2>&1; then
      warn "Found governance artifacts in protected path: $path"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done
if [ $VIOLATIONS -ne 0 ]; then
  echo "✗ Found $VIOLATIONS governance artifact violation(s)." >&2
  exit 1
fi

# Guardrails self-test
if [ -f "guardrails/check_guardrails.py" ]; then
  log "✓ Running guardrails self-test..."
  "$PYTHON" guardrails/check_guardrails.py
else
  warn "guardrails/check_guardrails.py not found; skipping guardrails self-test."
fi

# Session-aware validate-artifacts (optional)
SESSION_FILE=".idse_active_session.json"
PROJECT=""
SESSION=""
if [ -f "$SESSION_FILE" ]; then
  PROJECT="$("$PYTHON" - <<'PY'
import json
data=json.load(open(".idse_active_session.json"))
print(data.get("project",""))
PY
)"
  SESSION="$("$PYTHON" - <<'PY'
import json
data=json.load(open(".idse_active_session.json"))
print(data.get("session",""))
PY
)"
fi

if [ -f "idse-governance/validate-artifacts.py" ]; then
  if [ -n "$PROJECT" ] && [ -n "$SESSION" ]; then
    log "✓ Running validate-artifacts for project='$PROJECT' session='$SESSION'..."
    "$PYTHON" idse-governance/validate-artifacts.py --project "$PROJECT" --session "$SESSION" || warn "validate-artifacts reported issues"
  else
    warn "Active session not found; skipping validate-artifacts (provide project/session or .idse_active_session.json)."
  fi
else
  warn "idse-governance/validate-artifacts.py not found; skipping."
fi

# Pre-commit safety checks (optional)
if [ -f "scripts/pre_commit_check.py" ]; then
  log "✓ Running pre-commit safety checks..."
  "$PYTHON" scripts/pre_commit_check.py || warn "Pre-commit checks reported issues"
else
  warn "scripts/pre_commit_check.py not found; skipping pre-commit safety checks."
fi

log ""
log "✅ IDSE Governance Layer validation completed."
