"""
Session-scoped path manager for IDSE artifacts.

- Creates sessions and records metadata in .idse_active_session.json
- Builds per-session paths: projects/<project>/sessions/<session-id>/<stage>/<filename>
- Drops a .owner marker in the session metadata directory
"""

from __future__ import annotations

import json
import time
import getpass
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
ACTIVE_FILE = ROOT / ".idse_active_session.json"
HISTORY_FILE = ROOT / ".idse_sessions_history.json"


@dataclass
class SessionMeta:
    session_id: str
    name: str
    created_at: float
    owner: str
    project: str


class SessionManager:
    @staticmethod
    def create_session(name: Optional[str] = None, project: str = "default") -> str:
        """
        Create a new session and record it as active.
        """
        owner = getpass.getuser()
        ts = int(time.time())
        base = name.strip().replace(" ", "-") if name else f"session-{ts}"
        session_id = f"{base}-{ts}" if name else base
        meta = SessionMeta(
            session_id=session_id,
            name=name or base,
            created_at=float(ts),
            owner=owner,
            project=project or "default",
        )
        ACTIVE_FILE.write_text(json.dumps(asdict(meta), indent=2), encoding="utf-8")
        # Track latest session per project
        history = {}
        if HISTORY_FILE.exists():
            try:
                history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            except Exception:
                history = {}
        history[meta.project] = asdict(meta)
        HISTORY_FILE.write_text(json.dumps(history, indent=2), encoding="utf-8")
        return session_id

    @staticmethod
    def get_active_session() -> SessionMeta:
        """
        Return the active session metadata or raise if none is set.
        """
        if not ACTIVE_FILE.exists():
            raise RuntimeError("No active session. Call SessionManager.create_session(...) first.")
        data = json.loads(ACTIVE_FILE.read_text(encoding="utf-8"))
        return SessionMeta(**data)

    @staticmethod
    def resume_last_session(project: str = "default") -> Optional[SessionMeta]:
        """
        Resume the last session for the given project, if present in history.
        Returns the session meta or None if not found.
        """
        if not HISTORY_FILE.exists():
            return None
        try:
            history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            if project in history:
                meta = SessionMeta(**history[project])
                ACTIVE_FILE.write_text(json.dumps(history[project], indent=2), encoding="utf-8")
                return meta
        except Exception:
            return None
        return None

    @staticmethod
    def switch_project(project: str) -> SessionMeta:
        """
        Switch to the last session for a project if available; otherwise create a new session.
        """
        meta = SessionManager.resume_last_session(project=project)
        if meta:
            return meta
        SessionManager.create_session(project=project)
        return SessionManager.get_active_session()

    @staticmethod
    def build_path(stage: str, filename: str) -> Path:
        """
        Build a per-session, per-project path:
            projects/<project>/sessions/<session-id>/<stage>/<filename>
        Ensures the session directory exists and metadata/.owner is present.
        """
        meta = SessionManager.get_active_session()
        session_dir = ROOT / "projects" / meta.project / "sessions" / meta.session_id
        stage_dir = session_dir / stage
        stage_dir.mkdir(parents=True, exist_ok=True)

        metadata_dir = session_dir / "metadata"
        metadata_dir.mkdir(parents=True, exist_ok=True)
        owner_file = metadata_dir / ".owner"
        if not owner_file.exists():
            owner_file.write_text(meta.owner, encoding="utf-8")

        return stage_dir / filename

    @staticmethod
    def verify_ownership(path: Path, expected_owner: str) -> None:
        """
        Verify that the path belongs to the active session owner via .owner marker.
        """
        # Find the session directory (…/sessions/<session-id>)
        parts = list(path.resolve().parents)
        session_dir = next((p for p in parts if p.name and p.parent.name == "sessions"), None)
        if not session_dir:
            raise RuntimeError(f"Cannot locate session directory for path: {path}")
        owner_file = session_dir / ".owner"
        if not owner_file.exists():
            raise RuntimeError(f"Missing .owner in session directory: {session_dir}")
        actual = owner_file.read_text(encoding="utf-8").strip()
        if actual != expected_owner:
            raise PermissionError(f"Ownership mismatch: expected '{expected_owner}', found '{actual}'")
