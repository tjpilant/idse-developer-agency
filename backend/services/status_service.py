from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent.parent  # repo root
HISTORY_FILE = ROOT / ".idse_sessions_history.json"

STAGES = {
    "intent": ("intents", "intent.md"),
    "context": ("contexts", "context.md"),
    "spec": ("specs", "spec.md"),
    "plan": ("plans", "plan.md"),
    "testPlan": ("plans", "test-plan.md"),
    "tasks": ("tasks", "tasks.md"),
    "feedback": ("feedback", "feedback.md"),
}


@dataclass
class StageStatus:
    exists: bool
    requires_input_count: int
    path: Optional[str]


@dataclass
class ValidationSummary:
    ran: bool
    passed: bool
    errors: int
    warnings: int
    timestamp: Optional[str] = None


@dataclass
class SessionStatus:
    session_id: str
    name: str
    created_at: Optional[float]
    owner: Optional[str]
    stages: Dict[str, StageStatus]
    validation: Optional[ValidationSummary] = None
    # Session metadata introduced in Supabase migration 012
    session_type: str = "feature"
    is_blueprint: bool = False
    parent_session_id: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    status: str = "draft"
    collaborators: List[str] = field(default_factory=list)
    related_sessions: List[str] = field(default_factory=list)


@dataclass
class ProjectSessionsResponse:
    project_id: str
    sessions: List[SessionStatus]


class StatusService:
    def __init__(self):
        self.root = ROOT

    def list_projects(self) -> List[str]:
        # Use canonical projects-root structure
        projects_dir = self.root / "projects"
        if not projects_dir.exists():
            return []
        return sorted([p.name for p in projects_dir.iterdir() if p.is_dir()])

    def _load_history(self) -> Dict[str, Dict[str, str]]:
        if not HISTORY_FILE.exists():
            return {}
        try:
            return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Failed to read session history: %s", exc)
            return {}

    def _get_meta_for_session(self, project: str, session_id: str) -> Dict[str, Optional[str]]:
        history = self._load_history()
        project_entry = history.get(project, {})

        # Check if the project entry itself matches this session (old format)
        if project_entry.get("session_id") == session_id:
            return {
                "name": project_entry.get("name"),
                "created_at": project_entry.get("created_at"),
                "owner": project_entry.get("owner"),
                "session_type": project_entry.get("session_type"),
                "is_blueprint": project_entry.get("is_blueprint"),
                "parent_session_id": project_entry.get("parent_session_id"),
                "description": project_entry.get("description"),
                "tags": project_entry.get("tags"),
                "status": project_entry.get("status"),
                "collaborators": project_entry.get("collaborators"),
                "related_sessions": project_entry.get("related_sessions"),
            }

        # Check if session is nested inside project entry (new format)
        if session_id in project_entry:
            session_meta = project_entry[session_id]
            return {
                "name": session_meta.get("name", session_id),
                "created_at": session_meta.get("created_at"),
                "owner": session_meta.get("owner"),
                "session_type": session_meta.get("session_type"),
                "is_blueprint": session_meta.get("is_blueprint"),
                "parent_session_id": session_meta.get("parent_session_id"),
                "description": session_meta.get("description"),
                "tags": session_meta.get("tags"),
                "status": session_meta.get("status"),
                "collaborators": session_meta.get("collaborators"),
                "related_sessions": session_meta.get("related_sessions"),
            }

        # Fallback: check directory timestamps as last resort
        session_dir = self.root / "projects" / project / "sessions" / session_id
        if session_dir.exists():
            created_at = session_dir.stat().st_mtime
            return {
                "name": session_id,
                "created_at": created_at,
                "owner": None,
            }

        return {"name": session_id, "created_at": None, "owner": None}

    def count_requires_input(self, file_path: Path) -> int:
        if not file_path.exists():
            return 0
        try:
            text = file_path.read_text(encoding="utf-8")
            return text.count("[REQUIRES INPUT]")
        except Exception as exc:
            logger.warning("Failed to read %s: %s", file_path, exc)
            return 0

    def get_stage_status(self, project: str, session: str, stage_key: str) -> StageStatus:
        stage_dir, filename = STAGES[stage_key]
        # Use project-rooted structure
        path = self.root / "projects" / project / "sessions" / session / stage_dir / filename
        exists = path.exists()
        req_count = self.count_requires_input(path) if exists else 0
        return StageStatus(exists=exists, requires_input_count=req_count, path=str(path) if exists else None)

    def get_project_sessions(self, project: str) -> ProjectSessionsResponse:
        # Use project-rooted structure
        sessions_dir = self.root / "projects" / project / "sessions"
        if not sessions_dir.exists():
            raise FileNotFoundError(f"Project '{project}' not found")

        session_ids = sorted([p.name for p in sessions_dir.iterdir() if p.is_dir()])
        sessions: List[SessionStatus] = []

        for session_id in session_ids:
            meta = self._get_meta_for_session(project, session_id)
            stages = {k: self.get_stage_status(project, session_id, k) for k in STAGES.keys()}

            # Prefer metadata from history if present; otherwise infer sensible defaults
            is_blueprint = meta.get("is_blueprint")
            if is_blueprint is None:
                is_blueprint = session_id == "__blueprint__"

            session_type = meta.get("session_type")
            if not session_type:
                session_type = "blueprint" if is_blueprint else "feature"

            sessions.append(
                SessionStatus(
                    session_id=session_id,
                    name=meta.get("name") or session_id,
                    created_at=meta.get("created_at"),
                    owner=meta.get("owner"),
                    stages=stages,
                    validation=None,  # v1: no cached validation parsing
                    session_type=session_type,
                    is_blueprint=is_blueprint,
                    parent_session_id=meta.get("parent_session_id"),
                    description=meta.get("description"),
                    tags=meta.get("tags") or [],
                    status=meta.get("status") or "draft",
                    collaborators=meta.get("collaborators") or [],
                    related_sessions=meta.get("related_sessions") or [],
                )
            )

        return ProjectSessionsResponse(project_id=project, sessions=sessions)


status_service = StatusService()
