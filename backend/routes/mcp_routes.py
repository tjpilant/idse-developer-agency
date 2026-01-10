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
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter(prefix="/sync", tags=["MCP"])

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
    state_json: Optional[Dict] = None

class PullRequest(BaseModel):
    """Request to pull artifacts from Supabase to local"""
    project_id: str

class SyncResponse(BaseModel):
    """Response from sync operations"""
    success: bool
    project_id: str
    message: str
    synced_stages: List[str]
    timestamp: str

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
        # If project_id is None, create new project
        if not request.project_id:
            if not request.project_name:
                raise HTTPException(
                    status_code=400,
                    detail="project_name required when creating new project"
                )

            # Create new project
            result = supabase.table("projects").insert({
                "name": request.project_name,
                "stack": request.stack,
                "framework": request.framework,
                **request.artifacts,
                "state_json": request.state_json or {}
            }).execute()

            project_id = result.data[0]["id"]
            message = f"Created new project: {request.project_name}"

        else:
            # Update existing project
            update_data = {**request.artifacts}
            if request.state_json:
                update_data["state_json"] = request.state_json

            result = supabase.table("projects").update(
                update_data
            ).eq("id", request.project_id).execute()

            if not result.data:
                raise HTTPException(status_code=404, detail="Project not found")

            project_id = request.project_id
            message = f"Updated project: {project_id}"

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

    Usage:
        idse sync pull
        idse sync pull spec  # Pull only spec stage

    Example:
        POST /sync/pull
        {
          "project_id": "abc-123"
        }

    Returns:
        {
          "success": true,
          "project_id": "abc-123",
          "name": "customer-portal",
          "stack": "python",
          "framework": "agency-swarm",
          "artifacts": {
            "intent_md": "# Intent\\n...",
            "context_md": "# Context\\n...",
            ...
          },
          "state_json": {...},
          "updated_at": "2026-01-10T..."
        }
    """

    try:
        # Fetch project from Supabase
        result = supabase.table("projects").select("*").eq(
            "id", request.project_id
        ).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")

        project = result.data[0]

        # Extract artifacts (all *_md fields)
        artifacts = {
            key: value
            for key, value in project.items()
            if key.endswith("_md") and value is not None
        }

        return {
            "success": True,
            "project_id": project["id"],
            "name": project["name"],
            "stack": project.get("stack"),
            "framework": project.get("framework"),
            "artifacts": artifacts,
            "state_json": project.get("state_json", {}),
            "updated_at": project["updated_at"]
        }

    except Exception as e:
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
