from __future__ import annotations

from datetime import datetime
from pathlib import Path

from session_reader import SessionReader


class TemplateWriter:
    """Create simple draft artifacts for offline/hybrid mode."""

    DRAFT_MARKER = "[DRAFT - PENDING AGENCY REVIEW]"

    def __init__(self, base_dir: Path | str = Path(".")):
        self.base_dir = Path(base_dir)

    def _write(self, path: Path, content: str) -> Path:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        return path

    def create_intent_draft(self, description: str) -> Path:
        session = SessionReader.get_active_session(base_dir=self.base_dir)
        path = self._resolve_path("intents", "intent.md", session)
        body = f"""# Intent {self.DRAFT_MARKER}

## Description
{description}

## Success Criteria
[REQUIRES INPUT]

## Constraints
[REQUIRES INPUT]

---
Generated locally on {datetime.utcnow().isoformat()}Z.
Sync with the Agency to refine and approve.
"""
        return self._write(path, body)

    def create_spec_draft(self, intent_summary: str) -> Path:
        session = SessionReader.get_active_session(base_dir=self.base_dir)
        path = self._resolve_path("specs", "spec.md", session)
        body = f"""# Specification {self.DRAFT_MARKER}

## Intent Summary
{intent_summary}

## Overview
[REQUIRES INPUT]

## Requirements
[REQUIRES INPUT]

## Acceptance Criteria
[REQUIRES INPUT]

---
Generated locally on {datetime.utcnow().isoformat()}Z.
Sync with the Agency for full specification generation.
"""
        return self._write(path, body)

    def _resolve_path(self, stage: str, filename: str, session: dict | None) -> Path:
        if session:
            return (
                self.base_dir
                / stage
                / "projects"
                / session["project"]
                / "sessions"
                / session["session_id"]
                / filename
            )
        # simple fallback
        return self.base_dir / stage / filename

    @classmethod
    def is_draft(cls, content: str) -> bool:
        return cls.DRAFT_MARKER in content
