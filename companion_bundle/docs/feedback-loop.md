# Feedback Loop (IDE → Agency)

## What it does
After implementation, write a feedback log into the active session so the Agency can learn and archive the session.

## How to write feedback
Use `utils/feedback_writer.py`:
```bash
python - <<'PY'
from utils.feedback_writer import FeedbackWriter
fw = FeedbackWriter()
fw.write_feedback(
    changed_files=["src/app.py"],
    deviations=["Adjusted API contract to match reality"],
    test_results={"tests": "pass"},
    notes="All acceptance criteria met."
)
PY
```
This writes `feedback/projects/<project>/sessions/<session_id>/feedback.md`.

## Pre-commit checks
Run before pushing:
```bash
python scripts/pre_commit_check.py
```
Checks:
- Spec compliance (warns if draft/unresolved markers)
- Simple secret scan
- Boundary guardrail on changed files

## CI notify (optional)
Workflow `.github/workflows/validate-and-notify.yml` runs on push and can POST to `AGENCY_WEBHOOK_URL` if set (secret).

## Session awareness
All paths are session-scoped if `.idse_active_session.json` exists; otherwise fall back to simple paths.
