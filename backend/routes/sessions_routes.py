"""
Sessions Routes

API endpoints for managing IDSE sessions (blueprint and feature sessions).
Provides CRUD operations, lineage tracking, and session discovery.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])
logger = logging.getLogger(__name__)


# Pydantic Models

class Collaborator(BaseModel):
    name: str
    role: str = Field(..., description="Role: owner, contributor, reviewer, viewer")
    joined_at: str


class SessionCreate(BaseModel):
    project_id: str = Field(..., description="UUID of the project")
    session_id: str = Field(..., description="Session identifier (e.g., 'login-system')")
    name: str = Field(..., description="Display name for the session")
    session_type: str = Field(default="feature", description="Type: blueprint, feature, exploratory")
    description: Optional[str] = None
    is_blueprint: bool = False
    parent_session_id: Optional[str] = Field(None, description="UUID of parent session")
    tags: List[str] = Field(default_factory=list)
    owner: str = "system"
    collaborators: List[Collaborator] = Field(default_factory=list)
    status: str = Field(default="draft", description="Status: draft, in_progress, review, complete, archived")


class SessionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    collaborators: Optional[List[Collaborator]] = None


class SessionResponse(BaseModel):
    id: str
    project_id: str
    session_id: str
    name: str
    session_type: str
    description: Optional[str]
    is_blueprint: bool
    parent_session_id: Optional[str]
    owner: str
    status: str
    tags: List[str]
    collaborators: List[Dict]
    related_sessions: List[str]
    created_at: str
    updated_at: str


# Helper Functions

def _resolve_project_uuid(project_name: str) -> str:
    """Resolve project name to UUID."""
    supabase = get_supabase_client()
    resp = supabase.table("projects").select("id").eq("name", project_name).limit(1).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail=f"Project '{project_name}' not found")
    return resp.data[0]["id"]


def _resolve_session_uuid(project_id: str, session_id: str) -> Optional[str]:
    """Resolve session_id to UUID."""
    supabase = get_supabase_client()
    resp = (
        supabase.table("sessions")
        .select("id")
        .eq("project_id", project_id)
        .eq("session_id", session_id)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return None
    return resp.data[0]["id"]


# API Endpoints

@router.post("/create", response_model=SessionResponse, status_code=201)
async def create_session(payload: SessionCreate):
    """
    Create a new session (blueprint or feature).

    - Validates parent session exists if specified
    - Automatically links feature sessions to blueprint
    - Returns created session with full metadata
    """
    supabase = get_supabase_client()

    # Check if session already exists
    existing = (
        supabase.table("sessions")
        .select("id")
        .eq("project_id", payload.project_id)
        .eq("session_id", payload.session_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail=f"Session '{payload.session_id}' already exists in this project"
        )

    # Resolve parent session UUID if specified
    parent_uuid = None
    if payload.parent_session_id:
        parent_uuid = _resolve_session_uuid(payload.project_id, payload.parent_session_id)
        if not parent_uuid:
            raise HTTPException(
                status_code=404,
                detail=f"Parent session '{payload.parent_session_id}' not found"
            )

    # Prepare session data
    session_data = {
        "project_id": payload.project_id,
        "session_id": payload.session_id,
        "name": payload.name,
        "session_type": payload.session_type,
        "description": payload.description,
        "is_blueprint": payload.is_blueprint,
        "parent_session_id": parent_uuid,
        "owner": payload.owner,
        "status": payload.status,
        "tags": payload.tags,
        "collaborators": [c.dict() for c in payload.collaborators],
        "related_sessions": [],
        "metadata": {},
        "created_at": datetime.now().isoformat(),
    }

    # Insert session
    resp = supabase.table("sessions").insert(session_data).execute()

    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    return resp.data[0]


@router.get("/{project}/list", response_model=List[SessionResponse])
async def list_sessions(
    project: str,
    session_type: Optional[str] = Query(None, description="Filter by type: blueprint, feature, exploratory"),
    status: Optional[str] = Query(None, description="Filter by status"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
):
    """
    List all sessions in a project with optional filters.

    - Returns sessions sorted by creation date (newest first)
    - Supports filtering by type, status, or tag
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    # Build query
    query = supabase.table("sessions").select("*").eq("project_id", project_uuid)

    if session_type:
        query = query.eq("session_type", session_type)

    if status:
        query = query.eq("status", status)

    if tag:
        query = query.contains("tags", [tag])

    # Execute query
    resp = query.order("created_at", desc=True).execute()

    return resp.data


@router.get("/{project}/{session_id}", response_model=SessionResponse)
async def get_session(project: str, session_id: str):
    """
    Get detailed information about a specific session.

    - Returns full session metadata including lineage
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    resp = (
        supabase.table("sessions")
        .select("*")
        .eq("project_id", project_uuid)
        .eq("session_id", session_id)
        .limit(1)
        .execute()
    )

    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{session_id}' not found in project '{project}'"
        )

    return resp.data[0]


@router.get("/{project}/{session_id}/lineage")
async def get_session_lineage(project: str, session_id: str):
    """
    Get session lineage (parent and children).

    - Returns the session, its parent (if any), and all child sessions
    - Useful for visualizing session hierarchy
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    # Get the session
    session_resp = (
        supabase.table("sessions")
        .select("*")
        .eq("project_id", project_uuid)
        .eq("session_id", session_id)
        .limit(1)
        .execute()
    )

    if not session_resp.data:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{session_id}' not found"
        )

    session = session_resp.data[0]

    # Get parent
    parent = None
    if session.get("parent_session_id"):
        parent_resp = (
            supabase.table("sessions")
            .select("*")
            .eq("id", session["parent_session_id"])
            .limit(1)
            .execute()
        )
        if parent_resp.data:
            parent = parent_resp.data[0]

    # Get children
    children_resp = (
        supabase.table("sessions")
        .select("*")
        .eq("project_id", project_uuid)
        .eq("parent_session_id", session["id"])
        .execute()
    )

    return {
        "session": session,
        "parent": parent,
        "children": children_resp.data,
    }


@router.patch("/{project}/{session_id}", response_model=SessionResponse)
async def update_session(project: str, session_id: str, payload: SessionUpdate):
    """
    Update session metadata.

    - Updates only provided fields
    - Automatically updates updated_at timestamp
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    # Build update data (only include non-None fields)
    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.tags is not None:
        update_data["tags"] = payload.tags
    if payload.collaborators is not None:
        update_data["collaborators"] = [c.dict() for c in payload.collaborators]

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Update session
    resp = (
        supabase.table("sessions")
        .update(update_data)
        .eq("project_id", project_uuid)
        .eq("session_id", session_id)
        .execute()
    )

    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{session_id}' not found"
        )

    return resp.data[0]


@router.delete("/{project}/{session_id}", status_code=204)
async def delete_session(project: str, session_id: str):
    """
    Delete a session.

    - WARNING: This is a destructive operation
    - Cascade deletes all related documents
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    resp = (
        supabase.table("sessions")
        .delete()
        .eq("project_id", project_uuid)
        .eq("session_id", session_id)
        .execute()
    )

    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{session_id}' not found"
        )

    return None


@router.get("/{project}/blueprint", response_model=SessionResponse)
async def get_blueprint_session(project: str):
    """
    Get the blueprint session for a project.

    - Convenience endpoint to get the main governance session
    - Returns 404 if no blueprint exists
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    resp = (
        supabase.table("sessions")
        .select("*")
        .eq("project_id", project_uuid)
        .eq("is_blueprint", True)
        .limit(1)
        .execute()
    )

    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail=f"No blueprint session found for project '{project}'"
        )

    return resp.data[0]


@router.get("/{project}/features", response_model=List[SessionResponse])
async def get_feature_sessions(project: str):
    """
    Get all feature sessions for a project.

    - Returns only non-blueprint sessions
    - Sorted by creation date (newest first)
    """
    supabase = get_supabase_client()
    project_uuid = _resolve_project_uuid(project)

    resp = (
        supabase.table("sessions")
        .select("*")
        .eq("project_id", project_uuid)
        .eq("session_type", "feature")
        .order("created_at", desc=True)
        .execute()
    )

    return resp.data
