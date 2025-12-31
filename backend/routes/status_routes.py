from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException

from dataclasses import asdict

from backend.services.status_service import status_service, ProjectSessionsResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["status"])


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
