from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterable

from session_reader import SessionReader


class FeedbackWriter:
    """Write implementation feedback in session-aware paths."""

    def __init__(self, base_dir: Path | str = Path(".")):
        self.base_dir = Path(base_dir)

    def write_feedback(
        self,
        changed_files: Iterable[str],
        deviations: Iterable[str] | None = None,
        test_results: dict | None = None,
        notes: str | None = None,
    ) -> Path:
        session = SessionReader.get_active_session(base_dir=self.base_dir)
        if not session:
            raise RuntimeError("No active session (.idse_active_session.json missing)")

        feedback_path = (
            self.base_dir
            / "feedback"
            / "projects"
            / session["project"]
            / "sessions"
            / session["session_id"]
            / "feedback.md"
        )

        content = self._build_content(
            session_id=session["session_id"],
            project=session["project"],
            changed_files=list(changed_files),
            deviations=list(deviations or []),
            test_results=test_results or {},
            notes=notes or "",
        )

        feedback_path.parent.mkdir(parents=True, exist_ok=True)
        feedback_path.write_text(content)
        return feedback_path

    def _build_content(
        self,
        session_id: str,
        project: str,
        changed_files: list[str],
        deviations: list[str],
        test_results: dict,
        notes: str,
    ) -> str:
        timestamp = datetime.utcnow().isoformat() + "Z"
        changed = "\n".join(f"- {path}" for path in changed_files) or "None"
        devs = "\n".join(f"- {d}" for d in deviations) or "None"
        tests = "\n".join(f"- {k}: {v}" for k, v in test_results.items()) or "Not run"

        return f"""# Implementation Feedback

## Session Info
- Session: {session_id}
- Project: {project}
- Completed: {timestamp}

## Changes Made
{changed}

## Deviations from Plan
{devs}

## Test Results
{tests}

## Developer Notes
{notes or "None"}

## Status
- Status: completed_locally
- Next: awaiting_ci_validation
"""
