"""
Chat History Routes

Provides endpoints for persisting and retrieving chat messages across sessions.
Integrates with Supabase for storage and supports pagination.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime
import logging

from backend.services.supabase_client import get_supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class ChatMessage(BaseModel):
    """Chat message with full metadata"""
    id: str
    project_id: str
    session_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    metadata: dict = {}
    created_at: str  # ISO format datetime string


class SaveMessageRequest(BaseModel):
    """Request to save a single chat message"""
    project: str
    session: str
    role: Literal["user", "assistant", "system"]
    content: str
    metadata: dict = {}


class ChatHistoryResponse(BaseModel):
    """Paginated chat history response"""
    messages: List[ChatMessage]
    total_count: int
    has_more: bool


class MessageResponse(BaseModel):
    """Response after saving a message"""
    id: str
    created_at: str
    status: str = "saved"


@router.get("/api/chat/history/{project}/{session}", response_model=ChatHistoryResponse)
async def get_chat_history(
    project: str,
    session: str,
    limit: int = 100,
    offset: int = 0
):
    """
    Fetch chat messages for a specific project/session.

    Args:
        project: Project identifier
        session: Session identifier
        limit: Maximum number of messages to return (default 100)
        offset: Number of messages to skip (for pagination)

    Returns:
        ChatHistoryResponse with messages, total count, and pagination info
    """
    try:
        supabase = get_supabase_client()

        # Query for messages in this session
        response = (
            supabase.table("chat_messages")
            .select("*")
            .eq("project_id", project)
            .eq("session_id", session)
            .order("created_at", desc=False)  # Oldest first for chat display
            .range(offset, offset + limit - 1)
            .execute()
        )

        # Get total count for pagination
        count_response = (
            supabase.table("chat_messages")
            .select("id", count="exact")
            .eq("project_id", project)
            .eq("session_id", session)
            .execute()
        )

        total_count = count_response.count or 0
        messages = response.data or []

        # Convert to ChatMessage models
        chat_messages = [
            ChatMessage(
                id=str(msg["id"]),
                project_id=msg["project_id"],
                session_id=msg["session_id"],
                role=msg["role"],
                content=msg["content"],
                metadata=msg.get("metadata", {}),
                created_at=msg["created_at"]
            )
            for msg in messages
        ]

        has_more = (offset + len(messages)) < total_count

        logger.info(f"Retrieved {len(chat_messages)} messages for {project}/{session}")

        return ChatHistoryResponse(
            messages=chat_messages,
            total_count=total_count,
            has_more=has_more
        )

    except Exception as e:
        logger.error(f"Error fetching chat history for {project}/{session}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch chat history: {str(e)}"
        )


@router.post("/api/chat/messages", response_model=MessageResponse)
async def save_chat_message(request: SaveMessageRequest):
    """
    Save a single chat message to Supabase.

    Args:
        request: SaveMessageRequest with project, session, role, content

    Returns:
        MessageResponse with created message ID and timestamp
    """
    try:
        supabase = get_supabase_client()

        # Insert message
        response = (
            supabase.table("chat_messages")
            .insert({
                "project_id": request.project,
                "session_id": request.session,
                "role": request.role,
                "content": request.content,
                "metadata": request.metadata or {}
            })
            .execute()
        )

        if not response.data:
            raise Exception("Insert returned no data")

        created_message = response.data[0]

        logger.info(
            f"Saved {request.role} message for {request.project}/{request.session}"
        )

        return MessageResponse(
            id=str(created_message["id"]),
            created_at=created_message["created_at"]
        )

    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        # Don't raise - allow chat to continue even if persistence fails
        # Return a placeholder response
        return MessageResponse(
            id="error",
            created_at=datetime.now().isoformat(),
            status="failed"
        )


@router.delete("/api/chat/history/{project}/{session}")
async def clear_chat_history(project: str, session: str):
    """
    Clear all chat messages for a specific project/session.

    Args:
        project: Project identifier
        session: Session identifier

    Returns:
        Dict with deleted count
    """
    try:
        supabase = get_supabase_client()

        # Delete all messages for this session
        response = (
            supabase.table("chat_messages")
            .delete()
            .eq("project_id", project)
            .eq("session_id", session)
            .execute()
        )

        deleted_count = len(response.data) if response.data else 0

        logger.info(f"Cleared {deleted_count} messages for {project}/{session}")

        return {
            "deleted_count": deleted_count,
            "project": project,
            "session": session,
            "status": "cleared"
        }

    except Exception as e:
        logger.error(f"Error clearing chat history for {project}/{session}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear chat history: {str(e)}"
        )
