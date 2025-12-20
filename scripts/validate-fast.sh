#!/usr/bin/env bash
set -euo pipefail

# Prefer project venv Python; fallback to system python3
PY_BIN="${PY_BIN:-.venv/bin/python}"
if [ ! -x "$PY_BIN" ]; then
  PY_BIN="$(command -v python3 || true)"
fi
if [ -z "$PY_BIN" ]; then
  echo "ERROR: No python3 found; set PY_BIN to your interpreter." >&2
  exit 2
fi

PROJECT="${1:-}"
SESSION="${2:-}"

# Attempt to auto-detect project/session from .idse_active_session.json if not supplied
if [ -z "$PROJECT" ] || [ -z "$SESSION" ]; then
  if [ -f ".idse_active_session.json" ]; then
    PROJECT=$("$PY_BIN" - <<'PY'
import json
s=json.load(open('.idse_active_session.json'))
print(s.get('project',''))
PY
)
    SESSION=$("$PY_BIN" - <<'PY'
import json
s=json.load(open('.idse_active_session.json'))
print(s.get('session',''))
PY
)
  fi
fi

# Fallback: discover the first session intent file
if [ -z "$PROJECT" ] || [ -z "$SESSION" ]; then
  echo "No project/session supplied; attempting auto-discovery..."
  FIRST=$(find intents/projects -maxdepth 3 -name intent.md 2>/dev/null | head -n1 || true)
  if [ -n "$FIRST" ]; then
    PROJECT=$(echo "$FIRST" | awk -F/ '{for(i=1;i<=NF;i++) if($i=="projects"){print $(i+1); break}}')
    SESSION=$(echo "$FIRST" | awk -F/ '{for(i=1;i<=NF;i++) if($i=="sessions"){print $(i+1); break}}')
  fi
fi

if [ -z "$PROJECT" ] || [ -z "$SESSION" ]; then
  echo "ERROR: Could not determine project and session. Usage: $0 <project> <session>"
  exit 2
fi

echo "Fast validation: project='$PROJECT' session='$SESSION'"

MISSING=0
check_file() {
  if [ ! -f "$1" ]; then
    echo " MISSING: $1"
    MISSING=1
  else
    echo " OK: $1"
  fi
}

check_file "intents/projects/$PROJECT/sessions/$SESSION/intent.md"
check_file "contexts/projects/$PROJECT/sessions/$SESSION/context.md"
check_file "specs/projects/$PROJECT/sessions/$SESSION/spec.md"
check_file "plans/projects/$PROJECT/sessions/$SESSION/plan.md"
check_file "tasks/projects/$PROJECT/sessions/$SESSION/tasks.md"

echo "Quick checks complete."

# Run the canonical validate-artifacts script if present (fast/quick mode if supported)
if [ -f "idse-governance/validate-artifacts.py" ]; then
  echo "Running idse-governance/validate-artifacts.py (fast mode if supported)..."
  if "$PY_BIN" idse-governance/validate-artifacts.py --help 2>&1 | grep -q -- '--quick'; then
    "$PY_BIN" idse-governance/validate-artifacts.py --session "$SESSION" --quick || { echo "validate-artifacts.py reported issues"; MISSING=1; }
  else
    "$PY_BIN" idse-governance/validate-artifacts.py --session "$SESSION" || { echo "validate-artifacts.py reported issues"; MISSING=1; }
  fi
else
  echo "validate-artifacts.py not found; skipping full validation."
fi

if [ "$MISSING" -ne 0 ]; then
  echo "FAST VALIDATION: FAIL"
  exit 2
else
  echo "FAST VALIDATION: PASS"
  exit 0
fi
