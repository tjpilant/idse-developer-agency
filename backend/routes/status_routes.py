from __future__ import annotations

import logging
import json
import time
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional

from dataclasses import asdict

from backend.services.status_service import status_service, ProjectSessionsResponse
from backend.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["status"])
active_router = APIRouter(prefix="/api", tags=["active-session"])


class SetActiveSessionRequest(BaseModel):
    project: str
    session: str


@router.get("/")
async def list_projects():
    """
    List projects from Supabase projects table.
    Falls back to filesystem scan if Supabase is unavailable.
    """
    try:
        supabase = get_supabase_client()
        resp = supabase.table("projects").select("name").order("updated_at", desc=True).execute()
        names = [row["name"] for row in (resp.data or []) if "name" in row]
        if names:
            return {"projects": names}
    except Exception as exc:
        logger.warning("Supabase project fetch failed, falling back to filesystem: %s", exc)

    # Fallback to filesystem-based discovery
    projects = status_service.list_projects()
    return {"projects": projects}


@router.get("/{project_id}/sessions")
async def get_project_sessions(project_id: str) -> ProjectSessionsResponse:
    """
    Return sessions for a project sourced from Supabase sessions table.
    Falls back to filesystem scan if Supabase is unavailable.
    """
    try:
        supabase = get_supabase_client()

        # Resolve project UUID by name
        proj_resp = supabase.table("projects").select("id, name").eq("name", project_id).limit(1).execute()
        if not proj_resp.data:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found in Supabase")
        project_row = proj_resp.data[0]
        project_uuid = project_row["id"]

        sess_resp = (
            supabase.table("sessions")
            .select("session_id, name, owner, created_at")
            .eq("project_id", project_uuid)
            .order("created_at", desc=True)
            .execute()
        )
        rows = sess_resp.data or []

        sessions: list[dict[str, Any]] = []
        for row in rows:
            created_at = row.get("created_at")
            ts = None
            if created_at:
                try:
                    ts = datetime.fromisoformat(created_at.replace("Z", "+00:00")).timestamp()
                except Exception:
                    ts = None

            sessions.append(
                {
                    "session_id": row.get("session_id"),
                    "name": row.get("name") or row.get("session_id"),
                    "created_at": ts,
                    "owner": row.get("owner"),
                    "stages": {},  # Supabase does not track stage files; keep empty placeholder
                }
            )

        return {
            "project_id": project_id,
            "sessions": sessions,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Supabase session fetch failed, falling back to filesystem: %s", exc)
        try:
            result = status_service.get_project_sessions(project_id)
            return asdict(result)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
        except Exception as exc_inner:
            logger.exception("Failed to fetch sessions for project %s", project_id)
            raise HTTPException(status_code=500, detail="Failed to scan project sessions") from exc_inner


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


# ---------------------------------------------------------------------------
# Global active session endpoints (filesystem-based, no path verification)
# ---------------------------------------------------------------------------

class ActiveSessionSet(BaseModel):
    project: str
    session: str
    owner: Optional[str] = "user"
    created_at: Optional[float] = None


@active_router.get("/active/session")
async def get_active_session_global():
    """
    Return the active session from .idse_active_session.json.
    Defaults to IDSE_Core/milkdown-crepe if missing.
    """
    root = Path(__file__).resolve().parent.parent.parent
    active_file = root / ".idse_active_session.json"
    try:
        data = json.loads(active_file.read_text(encoding="utf-8"))
        return {
            "project": data.get("project", "IDSE_Core"),
            "session": data.get("session_id", "milkdown-crepe"),
        }
    except FileNotFoundError:
        return {"project": "IDSE_Core", "session": "milkdown-crepe"}
    except Exception as exc:
        logger.exception("Failed to read active session file")
        raise HTTPException(status_code=500, detail="Failed to read active session") from exc


@active_router.put("/active/session")
async def set_active_session_global(payload: ActiveSessionSet):
    """
    Persist the active session to .idse_active_session.json without verifying filesystem paths.
    """
    if not payload.project or not payload.session:
        raise HTTPException(status_code=400, detail="project and session required")

    root = Path(__file__).resolve().parent.parent.parent
    active_file = root / ".idse_active_session.json"
    data = {
        "project": payload.project,
        "session_id": payload.session,
        "name": payload.session,
        "created_at": payload.created_at or time.time(),
        "owner": payload.owner or "user",
    }
    try:
        active_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return {"status": "ok"}
    except Exception as exc:
        logger.exception("Failed to write active session file")
        raise HTTPException(status_code=500, detail="Failed to write active session") from exc
