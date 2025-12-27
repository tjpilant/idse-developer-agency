"""
FastAPI routes for git operations.

Provides HTTP endpoints for committing artifacts, creating PRs, and triggering
repository_dispatch events for GitHub Actions integration.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Add parent directory to path to import git_service
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.services.git_service import GitService

router = APIRouter(prefix="/api/git", tags=["git"])


class FileContent(BaseModel):
    """File path and content for commits."""
    path: str
    content: str


class CommitRequest(BaseModel):
    """Request body for commit endpoint."""
    session_id: str
    project: str
    files: List[FileContent]
    message: Optional[str] = None
    branch: Optional[str] = None
    trigger_dispatch: bool = True


class PRRequest(BaseModel):
    """Request body for PR creation."""
    head_branch: str
    base_branch: str = "main"
    title: str
    body: str


class DispatchRequest(BaseModel):
    """Request body for repository_dispatch."""
    event_type: str = "agency-update"
    session_id: str
    project: str
    commit_sha: Optional[str] = None
    additional_payload: Optional[Dict[str, Any]] = None


class BranchRequest(BaseModel):
    """Request body for branch creation."""
    branch_name: str
    from_branch: Optional[str] = None


@router.post("/commit")
async def commit_artifacts(request: CommitRequest):
    """
    Commit session artifacts to repository.

    Automatically triggers repository_dispatch event unless disabled.
    """
    try:
        git_service = GitService()

        # Convert Pydantic models to dicts
        files = [{"path": f.path, "content": f.content} for f in request.files]

        # Commit artifacts
        result = git_service.commit_artifacts(
            session_id=request.session_id,
            project=request.project,
            files=files,
            message=request.message,
            branch=request.branch
        )

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Commit failed"))

        # Trigger repository_dispatch if enabled
        if request.trigger_dispatch:
            dispatch_result = git_service.trigger_repository_dispatch(
                event_type="agency-update",
                session_id=request.session_id,
                project=request.project,
                commit_sha=result["commit_sha"]
            )

            result["dispatch"] = dispatch_result

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Git operation failed: {str(e)}")


@router.post("/pr")
async def create_pull_request(request: PRRequest):
    """Create a pull request."""
    try:
        git_service = GitService()
        result = git_service.create_pr(
            head_branch=request.head_branch,
            base_branch=request.base_branch,
            title=request.title,
            body=request.body
        )

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "PR creation failed"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PR creation failed: {str(e)}")


@router.get("/status")
async def check_status():
    """Check repository status and authentication."""
    try:
        git_service = GitService()
        result = git_service.check_repo_status()

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Status check failed"))

        return result

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.post("/dispatch")
async def trigger_dispatch(request: DispatchRequest):
    """Manually trigger repository_dispatch event."""
    try:
        git_service = GitService()
        result = git_service.trigger_repository_dispatch(
            event_type=request.event_type,
            session_id=request.session_id,
            project=request.project,
            commit_sha=request.commit_sha,
            additional_payload=request.additional_payload
        )

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Dispatch failed"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dispatch failed: {str(e)}")


@router.post("/branch")
async def create_branch(request: BranchRequest):
    """Create a new branch."""
    try:
        git_service = GitService()
        result = git_service.create_branch(
            branch_name=request.branch_name,
            from_branch=request.from_branch
        )

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Branch creation failed"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Branch creation failed: {str(e)}")
