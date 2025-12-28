from __future__ import annotations

import json
from pathlib import Path
from typing import Optional


class SessionReader:
    """Read-only helper for accessing Agency-managed session metadata."""

    SESSION_FILE = Path(".idse_active_session.json")

    @staticmethod
    def get_active_session(base_dir: Path | str = Path(".")) -> Optional[dict]:
        """Return parsed session metadata if available, else None."""
        session_path = Path(base_dir) / SessionReader.SESSION_FILE
        if not session_path.exists():
            return None

        try:
            return json.loads(session_path.read_text())
        except json.JSONDecodeError:
            return None

    @staticmethod
    def build_session_path(
        stage: str,
        filename: str,
        base_dir: Path | str = Path("."),
    ) -> str:
        """Build session-scoped path or fallback to simple path when no session."""
        session = SessionReader.get_active_session(base_dir=base_dir)
        if not session:
            return f"{stage}/{filename}"

        return (
            f"{stage}/projects/{session['project']}/"
            f"sessions/{session['session_id']}/{filename}"
        )
