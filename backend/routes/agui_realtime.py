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
from agency_swarm.ui.core.agui_adapter import AguiAdapter
from idse_developer_agent import idse_developer_agent

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple pub-sub for SSE events (one queue per subscriber)
subscribers: Set[asyncio.Queue[Dict[str, Any]]] = set()

# Initialize Agency + adapter for synchronous replies
adapter = AguiAdapter()
agency = Agency(
    idse_developer_agent,
    communication_flows=[],
    name="IDSEDeveloperAgency",
    shared_instructions="shared_instructions.md",
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

    Expected payload: { "type": "USER_MESSAGE", "content": "<text>" }
    """
    message_type = payload.get("type")
    content = payload.get("content")
    if message_type != "USER_MESSAGE" or not content:
        raise HTTPException(status_code=400, detail="Payload must include type=USER_MESSAGE and content.")

    try:
        # Run the sync Agency call off the event loop to avoid asyncio.run() conflicts
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": "Agent is thinking…"})
        response_text = await asyncio.to_thread(agency.get_response_sync, content)
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

        await enqueue_event({"type": "TEXT_MESSAGE_CONTENT", "content": response_str, "from": "assistant"})
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": "Agent finished."})
    except Exception as e:
        logger.exception("AG-UI inbound processing failed")
        await enqueue_event({"type": "SYSTEM_MESSAGE", "content": f"Agent error: {e}"})
        raise HTTPException(status_code=500, detail="Agent processing failed") from e

    return {"status": "ok"}
