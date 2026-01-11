"""
Lightweight AG-UI compatible realtime endpoints for the widget shell.

Endpoints:
- GET /stream    : Server-Sent Events (SSE) stream of AG-UI events
- POST /inbound  : Accepts user messages and emits assistant replies

Notes:
- Open CORS is already enabled in backend/main.py (allow_origins=["*"]).
- No auth applied; add auth guards if needed for production.
"""

import asyncio
import json
import logging
from typing import Any, Dict, Set

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from agency_swarm import Agency
from agency_swarm.tools.send_message import SendMessageHandoff
from agency_swarm.ui.core.agui_adapter import AguiAdapter
from idse_developer_agent import idse_developer_agent, component_designer_agent

logger = logging.getLogger(__name__)

# Chat persistence helper
async def persist_message_best_effort(project: str, session: str, role: str, content: str) -> None:
    """
    Persist a chat message to Supabase using best-effort strategy.

    This function NEVER raises exceptions - failures are logged but don't block chat.
    """
    try:
        from backend.services.supabase_client import get_supabase_client
        supabase = get_supabase_client()

        supabase.table("chat_messages").insert({
            "project_id": project,
            "session_id": session,
            "role": role,
            "content": content,
            "metadata": {}
        }).execute()

        logger.info(f"✅ Persisted {role} message for {project}/{session}")
    except Exception as e:
        logger.warning(f"⚠️ Failed to persist {role} message (chat continues): {e}")

router = APIRouter()

# Simple pub-sub for SSE events (one queue per subscriber)
subscribers: Set[asyncio.Queue[Dict[str, Any]]] = set()

# Initialize Agency + adapter for synchronous replies with proper communication flows
communication_flows = [
    (idse_developer_agent, component_designer_agent),  # Delegation
    (component_designer_agent, idse_developer_agent),  # Return handoff
]

adapter = AguiAdapter()
agency = Agency(
    idse_developer_agent,
    communication_flows=communication_flows,
    name="IDSEDeveloperAgency",
    shared_instructions="shared_instructions.md",
    send_message_tool_class=SendMessageHandoff,
)


async def enqueue_event(event: Dict[str, Any]) -> None:
    """Place an AG-UI event on all subscriber queues."""
    if not subscribers:
        return
    dead: Set[asyncio.Queue[Dict[str, Any]]] = set()
    for q in subscribers:
        try:
            q.put_nowait(event)
        except Exception:
            dead.add(q)
    # Clean up any broken queues
    for q in dead:
        subscribers.discard(q)


async def event_stream():
    """SSE generator for a single subscriber."""
    queue: asyncio.Queue[Dict[str, Any]] = asyncio.Queue()
    subscribers.add(queue)

    # Per-connection greeting
    await queue.put({"type": "SYSTEM_MESSAGE", "content": "AG-UI stream connected. Ask me about IDSE or publishing."})

    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=20)
                yield f"data: {json.dumps(event, default=str)}\n\n"
            except asyncio.TimeoutError:
                # Heartbeat to keep the connection alive
                yield "data: {\"type\":\"HEARTBEAT\"}\n\n"
    finally:
        subscribers.discard(queue)


@router.get("/stream")
async def stream_events():
    """Server-Sent Events endpoint for AG-UI clients."""
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/inbound")
async def inbound(payload: Dict[str, Any]):
    """
    Accept user messages and emit assistant replies to the SSE stream.

    Expected payload: { "type": "USER_MESSAGE", "content": "<text>", "project": "...", "session": "..." }
    """
    message_type = payload.get("type")
    content = payload.get("content")
    project = payload.get("project")
    session = payload.get("session")

    if message_type != "USER_MESSAGE" or not content:
        raise HTTPException(status_code=400, detail="Payload must include type=USER_MESSAGE and content.")

    # Track the active session so we can restore it after handling this request
    original_session = None
    try:
        from SessionManager import SessionManager
        original_session = SessionManager.get_active_session()
    except Exception:
        original_session = None

    # Persist user message to Supabase (best-effort)
    if project and session:
        await persist_message_best_effort(project, session, "user", content)

    # If project/session provided, set active session so downstream tools pick up context
    if project and session:
        try:
            import os
            from SessionManager import SessionManager
            meta = SessionManager.set_active_session(project=project, session=session)
            # Update environment variables so agent tools can access current context
            os.environ["IDSE_PROJECT"] = meta.project
            os.environ["IDSE_SESSION_ID"] = meta.session_id
            os.environ["IDSE_SESSION_NAME"] = meta.name
            os.environ["IDSE_OWNER"] = meta.owner
        except Exception as e:
            logger.warning(f"Failed to set active session context: {e}")

    try:
        # Run the sync Agency call off the event loop to avoid asyncio.run() conflicts
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": "Agent is thinking…"})
        # Small delay to ensure the "thinking" message is delivered before blocking
        await asyncio.sleep(0.1)

        # Inject session context into the message so agent is aware of current working context
        context_prefix = ""
        if project and session:
            context_prefix = f"[Context: You are working in project '{project}', session '{session}']\n\n"

        augmented_content = context_prefix + content
        response_text = await asyncio.to_thread(agency.get_response_sync, augmented_content)
        # Ensure the response is serializable
        response_str = response_text if isinstance(response_text, str) else str(response_text)

        # Strip debug/guardrail footers (e.g., RunResult / guardrail summaries)
        cleaned_lines = []
        stop_markers = ("runresult", "raw response", "new item(s)", "guardrail result")
        for line in response_str.splitlines():
            if any(marker in line.lower() for marker in stop_markers):
                break
            cleaned_lines.append(line)
        response_str = "\n".join(cleaned_lines).strip() or response_str

        # Persist assistant response to Supabase (best-effort)
        if project and session:
            await persist_message_best_effort(project, session, "assistant", response_str)

        await enqueue_event({"type": "TEXT_MESSAGE_CONTENT", "content": response_str, "from": "assistant"})
        # Small delay to ensure the response is delivered before the "finished" message
        await asyncio.sleep(0.1)
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": "Agent finished."})
    except Exception as e:
        logger.exception("AG-UI inbound processing failed")
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": f"Agent error: {e}"})
        raise HTTPException(status_code=500, detail="Agent processing failed") from e
    finally:
        # Keep the active session set by this request to reflect latest chat context.
        # No restoration to previous session so .idse_active_session.json matches current chat.
        pass

    return {"status": "ok"}
