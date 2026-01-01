from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dataclasses import asdict

from backend.services.status_service import status_service, ProjectSessionsResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["status"])


class SetActiveSessionRequest(BaseModel):
    project: str
    session: str


@router.get("/")
async def list_projects():
    """List all projects discovered under projects/* (projects-root canonical)"""
    projects = status_service.list_projects()
    return {"projects": projects}


@router.get("/{project_id}/sessions")
async def get_project_sessions(project_id: str) -> ProjectSessionsResponse:
    """Return session status for a given project."""
    try:
        result = status_service.get_project_sessions(project_id)
        return asdict(result)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    except Exception as exc:
        logger.exception("Failed to fetch sessions for project %s", project_id)
        raise HTTPException(status_code=500, detail="Failed to scan project sessions") from exc


@router.get("/active/session")
async def get_active_session():
    """Get the currently active session."""
    try:
        from SessionManager import SessionManager
        session = SessionManager.get_active_session()
        return asdict(session)
    except RuntimeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to get active session")
        raise HTTPException(status_code=500, detail="Failed to get active session") from exc


@router.put("/active/session")
async def set_active_session(request: SetActiveSessionRequest):
    """Set the active session by project and session ID."""
    try:
        import json
        import time
        from pathlib import Path

        # Load history to get session metadata
        history_file = Path(__file__).resolve().parent.parent.parent / ".idse_sessions_history.json"
        active_file = Path(__file__).resolve().parent.parent.parent / ".idse_active_session.json"
        projects_root = Path(__file__).resolve().parent.parent.parent / "projects"

        # Verify session exists on filesystem
        session_path = projects_root / request.project / "sessions" / request.session
        if not session_path.exists():
            raise HTTPException(status_code=404, detail=f"Session folder '{request.session}' not found in project '{request.project}'")

        # Load or create history
        history = {}
        if history_file.exists():
            try:
                history = json.loads(history_file.read_text(encoding="utf-8"))
            except:
                history = {}

        # Find or create session metadata
        session_meta = None
        project_data = history.get(request.project, {})

        # Check if it's the old format (with session_id at project level) or new format (nested sessions)
        if isinstance(project_data, dict) and "session_id" in project_data:
            # Old format - project has session_id directly
            if project_data["session_id"] == request.session:
                session_meta = project_data
            else:
                # Check nested sessions
                session_meta = project_data.get(request.session)
        else:
            # New format - nested sessions only
            session_meta = project_data.get(request.session)

        # If not found in history, create from filesystem
        if not session_meta:
            logger.info(f"Session '{request.session}' not in history, creating entry from filesystem")
            session_meta = {
                "created_at": session_path.stat().st_ctime,
                "owner": "unknown",
                "status": "active"
            }

        # Ensure we have the full session metadata
        session_data = {
            "session_id": request.session,
            "name": session_meta.get("name", request.session),
            "created_at": session_meta.get("created_at", time.time()),
            "owner": session_meta.get("owner", "unknown"),
            "project": request.project,
        }

        # Write to active session file
        active_file.write_text(json.dumps(session_data, indent=2), encoding="utf-8")

        return {"status": "ok", "session": session_data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to set active session")
        raise HTTPException(status_code=500, detail=f"Failed to set active session: {exc}") from exc
