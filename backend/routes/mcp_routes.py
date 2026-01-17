"""
MCP (Machine-to-Cloud Protocol) Routes
Lightweight HTTP endpoints for syncing local IDSE projects to Supabase

Architecture:
- Local: IDE works with .idse/projects/ (fast, offline)
- Remote: Supabase stores "Agency copy" (canonical, centralized)
- Bridge: These MCP endpoints (manual sync via idse push/pull)
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Dict, Optional, List
import json
import logging
import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter(prefix="/sync", tags=["MCP"])
logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ============================================================================
# Request/Response Models
# ============================================================================

class PushRequest(BaseModel):
    """Request to push local artifacts to Supabase"""
    project_id: Optional[str] = None  # If None, creates new project
    project_name: Optional[str] = None  # Required if creating new
    stack: Optional[str] = "python"
    framework: Optional[str] = None
    artifacts: Dict[str, str]  # {"intent_md": "content", "spec_md": "content", ...}
    state_json: Optional[Dict] = None  # Project-level state
    session_id: Optional[str] = "__blueprint__"
    session_metadata: Optional[Dict] = None  # Rich session metadata (type, parent, etc.)
    session_state_json: Optional[Dict] = None  # Session-level state/stages

class PullRequest(BaseModel):
    """Request to pull artifacts from Supabase to local"""
    project_id: str
    session_id: Optional[str] = "__blueprint__"  # Default to blueprint session

class SyncResponse(BaseModel):
    """Response from sync operations"""
    success: bool
    project_id: str
    message: str
    synced_stages: List[str]
    timestamp: str


class SessionStateUpdate(BaseModel):
    """Request to update session state"""
    stages: Optional[Dict[str, str]] = None  # {"intent": "complete", ...}
    last_agent: Optional[str] = None
    progress_percent: Optional[int] = None


class DeleteSessionResponse(BaseModel):
    success: bool
    project_id: str
    session_id: str
    message: str

# ============================================================================
# Endpoints
# ============================================================================

@router.post("/push", response_model=SyncResponse)
async def sync_push(
    request: PushRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Push local project artifacts to Supabase.

    Usage:
        idse sync push
        idse sync push spec  # Push only spec stage

    Example:
        POST /sync/push
        {
          "project_id": "abc-123",  # or null to create new
          "artifacts": {
            "intent_md": "# Intent\\n...",
            "context_md": "# Context\\n...",
            "spec_md": "# Specification\\n..."
          },
          "state_json": {
            "stages": {
              "intent": "complete",
              "context": "complete",
              "spec": "in_progress"
            },
            "last_agent": "Claude Code"
          }
        }
    """

    try:
        # If project_id is None, create new project; otherwise update existing
        # Resolve project_id if missing by looking up existing by name
        project_id = request.project_id
        created_project = False
        if not project_id and request.project_name:
            existing = (
                supabase.table("projects")
                .select("id")
                .eq("name", request.project_name)
                .limit(1)
                .execute()
            )
            if existing.data:
                project_id = existing.data[0]["id"]

        if not project_id:
            if not request.project_name:
                raise HTTPException(
                    status_code=400,
                    detail="project_name required when creating new project"
                )

            proj_result = supabase.table("projects").insert({
                "name": request.project_name,
                "stack": request.stack or "python",
                "framework": request.framework,
                "state_json": request.state_json or {}
            }).execute()

            if not proj_result.data:
                raise HTTPException(status_code=500, detail="Failed to create project")

            project_id = proj_result.data[0]["id"]
            created_project = True

            try:
                supabase.table("sessions").insert({
                    "project_id": project_id,
                    "session_id": "__blueprint__",
                    "name": "Project Blueprint (IDD)",
                    "owner": "agency",
                    "is_blueprint": True,
                    "state_json": request.state_json or {}
                }).execute()
            except Exception as session_err:
                logger.warning("Failed to create blueprint session for %s: %s", project_id, session_err)

        # Upsert/update existing project using provided or newly created project_id
        update_payload = {
            "id": project_id,
            "name": request.project_name,
            "stack": request.stack,
            "framework": request.framework,
            **request.artifacts,
        }
        if request.state_json is not None:
            update_payload["state_json"] = request.state_json

        result = supabase.table("projects").upsert(
            update_payload,
            on_conflict="id"
        ).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")

        message = f"Created new project: {request.project_name}" if created_project else f"Updated project: {project_id}"

        # ------------------------------------------------------------------
        # Upsert the target session (blueprint or feature)
        # ------------------------------------------------------------------
        session_id = request.session_id or "__blueprint__"
        session_meta = request.session_metadata or {}
        is_blueprint = session_meta.get("is_blueprint", session_id == "__blueprint__")
        session_type = session_meta.get("session_type") or ("blueprint" if is_blueprint else "feature")
        parent_session_slug = session_meta.get("parent_session") or ("__blueprint__" if not is_blueprint else None)

        # Resolve parent_session_id UUID for Supabase foreign key
        parent_session_id = None
        if parent_session_slug and parent_session_slug != session_id:
            try:
                parent_lookup = (
                    supabase.table("sessions")
                    .select("id")
                    .eq("project_id", project_id)
                    .eq("session_id", parent_session_slug)
                    .limit(1)
                    .execute()
                )
                if parent_lookup.data:
                    parent_session_id = parent_lookup.data[0]["id"]
            except Exception as parent_err:
                logger.warning("Failed to resolve parent session %s for project %s: %s", parent_session_slug, project_id, parent_err)

        session_state = request.session_state_json
        if session_state is None:
            # Fall back to project-level state if provided (legacy behavior)
            session_state = request.state_json

        session_payload = {
            "project_id": project_id,
            "session_id": session_id,
            "name": session_meta.get("name") or ("Project Blueprint (IDD)" if is_blueprint else session_id),
            "owner": session_meta.get("owner") or "agency",
            "session_type": session_type,
            "is_blueprint": is_blueprint,
            "parent_session_id": parent_session_id,
            "description": session_meta.get("description"),
            "tags": session_meta.get("tags") or [],
            "status": session_meta.get("status") or "draft",
            "collaborators": session_meta.get("collaborators") or [],
            "related_sessions": session_meta.get("related_sessions") or [],
        }

        if session_state is not None:
            session_payload["state_json"] = session_state

        try:
            supabase.table("sessions").upsert(
                session_payload,
                on_conflict="project_id,session_id"
            ).execute()
        except Exception as sess_err:
            logger.warning("Failed to upsert session %s for project %s: %s", session_id, project_id, sess_err)

        # Persist artifacts into documents table for the blueprint session so editors can read them
        def _stage_to_path(stage: str) -> str:
            mapping = {
                "meta": "meta/meta.md",
                "intent": "intents/intent.md",
                "context": "contexts/context.md",
                "spec": "specs/spec.md",
                "plan": "plans/plan.md",
                "tasks": "tasks/tasks.md",
                "feedback": "feedback/feedback.md",
                "implementation": "implementation/README.md",
            }
            return mapping.get(stage, f"{stage}.md")

        for key, content in request.artifacts.items():
            if not key.endswith("_md"):
                continue
            stage = key[:-3]  # drop '_md'
            path = _stage_to_path(stage)
            try:
                supabase.table("documents").upsert(
                    {
                        "project_id": project_id,
                        "session_slug": session_id,
                        "path": path,
                        "stage": stage,
                        "content": content or "",
                        "metadata": {},
                    },
                    on_conflict="project_id,session_slug,path",
                ).execute()
            except Exception as doc_err:
                logger.warning("Failed to upsert document %s for %s: %s", path, project_id, doc_err)

        # Determine which stages were synced
        synced_stages = [
            stage.replace("_md", "")
            for stage in request.artifacts.keys()
            if stage.endswith("_md")
        ]

        return SyncResponse(
            success=True,
            project_id=project_id,
            message=message,
            synced_stages=synced_stages,
            timestamp=result.data[0]["updated_at"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pull", response_model=Dict)
async def sync_pull(
    request: PullRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Pull project artifacts from Supabase to local.

    Now reads from the documents table with session support instead of
    the legacy project-level *_md fields.

    Usage:
        idse sync pull
        idse sync pull --session feature-login

    Example:
        POST /sync/pull
        {
          "project_id": "abc-123",
          "session_id": "__blueprint__"
        }

    Returns:
        {
          "success": true,
          "project_id": "abc-123",
          "session_id": "__blueprint__",
          "name": "customer-portal",
          "artifacts": {
            "intents/intent.md": "# Intent\\n...",
            "contexts/context.md": "# Context\\n...",
            ...
          },
          "session_state": {...},
          "updated_at": "2026-01-10T..."
        }
    """

    try:
        # Fetch project metadata
        project_result = supabase.table("projects").select(
            "id, name, stack, framework, updated_at"
        ).eq("id", request.project_id).execute()

        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")

        project = project_result.data[0]
        session_id = request.session_id or "__blueprint__"

        # Fetch session metadata
        session_result = supabase.table("sessions").select(
            "id, session_id, name, state_json, is_blueprint, session_type, updated_at"
        ).eq("project_id", request.project_id).eq("session_id", session_id).execute()

        session_data = session_result.data[0] if session_result.data else None

        # Fetch documents for this project/session from documents table
        docs_result = supabase.table("documents").select(
            "path, stage, content, updated_at"
        ).eq("project_id", request.project_id).eq("session_slug", session_id).execute()

        # Build artifacts dict keyed by path
        artifacts = {}
        latest_updated = project["updated_at"]

        for doc in (docs_result.data or []):
            path = doc.get("path")
            content = doc.get("content")
            if path and content:
                artifacts[path] = content
                # Track latest update time
                doc_updated = doc.get("updated_at")
                if doc_updated and doc_updated > latest_updated:
                    latest_updated = doc_updated

        return {
            "success": True,
            "project_id": project["id"],
            "session_id": session_id,
            "name": project["name"],
            "stack": project.get("stack"),
            "framework": project.get("framework"),
            "artifacts": artifacts,
            "session_state": session_data.get("state_json", {}) if session_data else {},
            "is_blueprint": session_data.get("is_blueprint", False) if session_data else False,
            "session_type": session_data.get("session_type", "feature") if session_data else "feature",
            "updated_at": latest_updated
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Pull failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{project_id}")
async def get_sync_status(project_id: str):
    """
    Get sync status for a project.

    Returns metadata about when project was last synced, which stages are complete, etc.
    """

    try:
        result = supabase.table("projects").select(
            "id, name, state_json, updated_at, created_at"
        ).eq("id", project_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")

        project = result.data[0]
        state_json = project.get("state_json", {})

        return {
            "project_id": project["id"],
            "project_name": project["name"],
            "last_synced": project["updated_at"],
            "created_at": project["created_at"],
            "state": state_json.get("stages", {}),
            "last_agent": state_json.get("last_agent")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/blueprints")
async def list_blueprints():
    """List all projects with blueprint sessions."""
    try:
        result = supabase.table("projects").select(
            "id, name, state_json"
        ).execute()

        blueprints = []
        for proj in result.data:
            raw_state = proj.get("state_json") or {}
            if isinstance(raw_state, str):
                try:
                    state = json.loads(raw_state)
                except json.JSONDecodeError:
                    state = {}
            else:
                state = raw_state

            stages = state.get("stages", {})
            total = len(stages)
            complete = sum(1 for s in stages.values() if s in ["complete", "completed"])
            progress = int((complete / total) * 100) if total > 0 else 0

            blueprints.append({
                "project_id": proj["id"],
                "project_name": proj["name"],
                "progress_percent": progress
            })

        return {"blueprints": blueprints}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{project_id}/{session_id}")
async def get_session_sync_status(project_id: str, session_id: str):
    """
    Get sync status for a specific session within a project.

    Args:
        project_id: UUID of the project
        session_id: Session slug (e.g., 'puck-components', '__blueprint__')

    Returns:
        {
            "project_id": str,
            "project_name": str,
            "session_id": str,
            "session_name": str,
            "is_blueprint": bool,
            "last_synced": str,
            "created_at": str,
            "state": dict,
            "last_agent": str,
            "progress_percent": int
        }
    """
    try:
        proj_result = supabase.table("projects").select(
            "id, name"
        ).eq("id", project_id).execute()

        if not proj_result.data:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        project = proj_result.data[0]

        sess_result = supabase.table("sessions").select(
            "session_id, name, state_json, updated_at, created_at, is_blueprint"
        ).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not sess_result.data:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found in project '{project['name']}'"
            )

        session = sess_result.data[0]
        raw_state = session.get("state_json") or {}
        if isinstance(raw_state, str):
            try:
                state_json = json.loads(raw_state)
            except json.JSONDecodeError:
                logger.warning("state_json stored as string but not valid JSON for %s/%s", project_id, session_id)
                state_json = {}
        else:
            state_json = raw_state

        return {
            "project_id": project["id"],
            "project_name": project["name"],
            "session_id": session["session_id"],
            "session_name": session["name"],
            "is_blueprint": session.get("is_blueprint", False),
            "last_synced": session.get("updated_at"),
            "created_at": session.get("created_at"),
            "state": state_json.get("stages", {}),
            "last_agent": state_json.get("last_agent"),
            "progress_percent": state_json.get("progress_percent", 0)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/status/{project_id}/{session_id}")
async def update_session_sync_status(
    project_id: str,
    session_id: str,
    update: SessionStateUpdate,
    authorization: Optional[str] = Header(None)
):
    """
    Update sync status for a specific session.
    """
    try:
        sess_check = supabase.table("sessions").select(
            "id, state_json"
        ).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not sess_check.data:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found"
            )

        raw_state = sess_check.data[0].get("state_json") or {}
        if isinstance(raw_state, str):
            try:
                current_state = json.loads(raw_state)
            except json.JSONDecodeError:
                logger.warning("state_json stored as string but not valid JSON for %s/%s", project_id, session_id)
                current_state = {}
        else:
            current_state = raw_state
        updated_fields = []

        if update.stages is not None:
            valid_stages = {"intent", "context", "spec", "plan", "tasks", "implementation", "feedback"}
            valid_statuses = {"pending", "in_progress", "complete", "completed"}

            for stage, status in update.stages.items():
                if stage not in valid_stages:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid stage name: {stage}"
                    )
                if status not in valid_statuses:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid status for {stage}: {status}"
                    )

            current_state["stages"] = {**current_state.get("stages", {}), **update.stages}
            updated_fields.append("stages")

        if update.last_agent is not None:
            current_state["last_agent"] = update.last_agent
            updated_fields.append("last_agent")

        if update.progress_percent is not None:
            if not (0 <= update.progress_percent <= 100):
                raise HTTPException(
                    status_code=400,
                    detail="progress_percent must be between 0 and 100"
                )
            current_state["progress_percent"] = update.progress_percent
            updated_fields.append("progress_percent")

        if "stages" in updated_fields and "progress_percent" not in updated_fields:
            stages = current_state.get("stages", {})
            total = len(stages)
            complete = sum(1 for status in stages.values() if status in ["complete", "completed"])
            current_state["progress_percent"] = int((complete / total) * 100) if total > 0 else 0

        result = supabase.table("sessions").update({
            "state_json": current_state
        }).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Update failed")

        return {
            "success": True,
            "project_id": project_id,
            "session_id": session_id,
            "updated_fields": updated_fields,
            "timestamp": result.data[0].get("updated_at")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{project_id}/{session_id}", response_model=DeleteSessionResponse)
async def delete_session(project_id: str, session_id: str, force: bool = False):
    """
    Delete a session from a project (and its documents).

    Safeguards:
    - Prevent deleting __blueprint__ unless force=true.
    """
    if session_id == "__blueprint__" and not force:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete blueprint session without force=true"
        )
    try:
        # Resolve project_id if a name was provided
        def _resolve_project_id(pid_or_name: str) -> str:
            try:
                uuid.UUID(pid_or_name)
                return pid_or_name
            except ValueError:
                lookup = supabase.table("projects").select("id").eq("name", pid_or_name).limit(1).execute()
                if not lookup.data:
                    raise HTTPException(status_code=404, detail=f"Project '{pid_or_name}' not found")
                return lookup.data[0]["id"]

        resolved_project_id = _resolve_project_id(project_id)

        proj_result = supabase.table("projects").select("id").eq("id", resolved_project_id).limit(1).execute()
        if not proj_result.data:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        delete_result = (
            supabase.table("sessions")
            .delete()
            .eq("project_id", resolved_project_id)
            .eq("session_id", session_id)
            .execute()
        )

        supabase.table("documents").delete().eq("project_id", resolved_project_id).eq("session_slug", session_id).execute()

        # Check if deletion was successful (modern Supabase client doesn't have .error attribute)
        # If delete succeeded, the session should no longer exist
        check = supabase.table("sessions").select("session_id").eq("project_id", resolved_project_id).eq("session_id", session_id).limit(1).execute()
        if check.data:
            raise HTTPException(status_code=500, detail=f"Failed to delete session '{session_id}'")

        return DeleteSessionResponse(
            success=True,
            project_id=resolved_project_id,
            session_id=session_id,
            message=f"Deleted session '{session_id}'"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete session %s/%s: %s", project_id, session_id, e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects")
async def list_projects():
    """
    List all projects in Supabase.

    Useful for:
    - idse sync list
    - Dashboard showing all active projects
    """

    try:
        result = supabase.table("projects").select(
            "id, name, stack, framework, state_json, updated_at"
        ).order("updated_at", desc=True).execute()

        return {
            "success": True,
            "count": len(result.data),
            "projects": result.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Utility: Validate sync token
# ============================================================================

def validate_sync_token(token: Optional[str]) -> bool:
    """
    Validate client sync token.

    For now, accepts any token (TODO: Implement proper JWT validation).
    In production, this should validate against clients table in Supabase.
    """
    if not token:
        return False

    # TODO: Validate JWT token against Supabase auth
    # For now, accept any non-empty token
    return len(token) > 0


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health")
async def health_check():
    """Check if MCP service is running and Supabase is accessible"""

    try:
        # Test Supabase connection
        result = supabase.table("projects").select("id").limit(1).execute()

        return {
            "status": "healthy",
            "supabase_connected": True,
            "message": "MCP sync service operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "supabase_connected": False,
            "error": str(e)
        }
