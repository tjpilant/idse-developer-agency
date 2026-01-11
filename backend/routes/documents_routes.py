"""
Documents Routes

Expose minimal CRUD for pipeline documents stored in Supabase.
Documents are keyed by project (name), session_slug (text), and path (stage file path).
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import logging
from datetime import datetime

from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/documents", tags=["Documents"])
logger = logging.getLogger(__name__)


class DocumentUpsert(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None
    stage: Optional[str] = None


class DocumentResponse(BaseModel):
    project: str
    session: str
    path: str
    stage: Optional[str]
    content: str
    metadata: Dict[str, Any]
    updated_at: Optional[str] = None


def _resolve_project_uuid(project_name: str) -> str:
    supabase = get_supabase_client()
    resp = supabase.table("projects").select("id").eq("name", project_name).limit(1).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail=f"Project '{project_name}' not found")
    return resp.data[0]["id"]


# Legacy endpoint for MD editor compatibility
router_legacy = APIRouter(prefix="/api/sessions", tags=["Documents (Legacy)"])


class LegacyDocumentPut(BaseModel):
    path: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    stage: Optional[str] = None


@router_legacy.get("/{project}/{session}/documents", response_model=DocumentResponse)
async def get_document_legacy(project: str, session: str, path: str = Query(...)):
    """Legacy endpoint for MD editor compatibility - proxies to main documents endpoint."""
    # Normalize path - strip filesystem prefix if present
    # e.g., "projects/Puck_Docs/sessions/session-01/intents/intent.md" -> "intents/intent.md"
    if path.startswith("projects/"):
        parts = path.split("/")
        # Find the session part and extract everything after it
        if "sessions" in parts:
            session_idx = parts.index("sessions")
            # Skip "sessions" and session name, take the rest
            if len(parts) > session_idx + 2:
                path = "/".join(parts[session_idx + 2:])

    # Map common filenames to their standard paths
    path_map = {
        "intent.md": "intents/intent.md",
        "context.md": "contexts/context.md",
        "spec.md": "specs/spec.md",
        "plan.md": "plans/plan.md",
        "tasks.md": "tasks/tasks.md",
        "feedback.md": "feedback/feedback.md",
        "README.md": "implementation/README.md"
    }

    # Extract just the filename if a full path was provided
    doc_filename = path.split('/')[-1] if '/' in path else path
    final_path = path_map.get(doc_filename, path)

    # Call the main endpoint
    return await get_document(project, session, final_path)


@router_legacy.put("/{project}/{session}/documents", response_model=DocumentResponse)
async def put_document_legacy(project: str, session: str, payload: LegacyDocumentPut):
    """Legacy PUT endpoint for MD editor compatibility - accepts path in body."""
    path = payload.path

    # Normalize path - strip filesystem prefix if present
    if path.startswith("projects/"):
        parts = path.split("/")
        if "sessions" in parts:
            session_idx = parts.index("sessions")
            if len(parts) > session_idx + 2:
                path = "/".join(parts[session_idx + 2:])

    # Map common filenames to their standard paths
    path_map = {
        "intent.md": "intents/intent.md",
        "context.md": "contexts/context.md",
        "spec.md": "specs/spec.md",
        "plan.md": "plans/plan.md",
        "tasks.md": "tasks/tasks.md",
        "feedback.md": "feedback/feedback.md",
        "README.md": "implementation/README.md"
    }

    # Extract just the filename if a full path was provided
    doc_filename = path.split('/')[-1] if '/' in path else path
    final_path = path_map.get(doc_filename, path)

    # Create upsert payload
    upsert_payload = DocumentUpsert(
        content=payload.content,
        metadata=payload.metadata,
        stage=payload.stage
    )

    # Call the main endpoint
    return await upsert_document(project, session, final_path, upsert_payload)


@router.get("/{project}/{session}/{doc_path:path}", response_model=DocumentResponse)
async def get_document(project: str, session: str, doc_path: str):
    """Fetch a document for a project/session/path."""
    try:
        supabase = get_supabase_client()
        project_uuid = _resolve_project_uuid(project)

        resp = (
            supabase.table("documents")
            .select("path, stage, content, metadata, updated_at")
            .eq("project_id", project_uuid)
            .eq("session_slug", session)
            .eq("path", doc_path)
            .limit(1)
            .execute()
        )
        if not resp.data:
            # If the doc is missing, return an empty stub so the editor can create it
            return DocumentResponse(
                project=project,
                session=session,
                path=doc_path,
                stage=None,
                content="",
                metadata={},
                updated_at=None,
            )

        doc = resp.data[0]
        return DocumentResponse(
            project=project,
            session=session,
            path=doc_path,
            stage=doc.get("stage"),
            content=doc.get("content", ""),
            metadata=doc.get("metadata") or {},
            updated_at=doc.get("updated_at"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch document %s/%s/%s", project, session, doc_path)
        raise HTTPException(status_code=500, detail="Failed to fetch document") from exc


@router.put("/{project}/{session}/{doc_path:path}", response_model=DocumentResponse)
async def upsert_document(project: str, session: str, doc_path: str, payload: DocumentUpsert):
    """Create or update a document for a project/session/path."""
    try:
        supabase = get_supabase_client()
        project_uuid = _resolve_project_uuid(project)

        record = {
            "project_id": project_uuid,
            "session_slug": session,
            "path": doc_path,
            "stage": payload.stage,
            "content": payload.content if payload.content is not None else "",
            "metadata": payload.metadata or {},
        }

        resp = (
            supabase.table("documents")
            .upsert(record, on_conflict="project_id,session_slug,path")
            .execute()
        )

        if not resp.data:
            raise HTTPException(status_code=500, detail="Upsert returned no data")

        doc = resp.data[0]
        return DocumentResponse(
            project=project,
            session=session,
            path=doc_path,
            stage=doc.get("stage"),
            content=doc.get("content", ""),
            metadata=doc.get("metadata") or {},
            updated_at=doc.get("updated_at"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to upsert document %s/%s/%s", project, session, doc_path)
        raise HTTPException(status_code=500, detail="Failed to upsert document") from exc
