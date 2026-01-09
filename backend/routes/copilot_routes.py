"""
CopilotKit Protocol Routes

Provides CopilotKit-compatible endpoints for embeddable chat widgets.
Supports both HTTP and WebSocket connections.
"""

from fastapi import APIRouter, WebSocket, HTTPException, Query
from typing import Dict, Any
import logging
import uuid

from agency_swarm import Agency
from agency_swarm.tools.send_message import SendMessageHandoff
from idse_developer_agent import idse_developer_agent, component_designer_agent
from backend.adapters.copilot_adapter import CopilotAdapter

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Create agency instance for CopilotKit interactions with proper communication flows
communication_flows = [
    (idse_developer_agent, component_designer_agent),  # Delegation
    (component_designer_agent, idse_developer_agent),  # Return handoff
]

agency = Agency(
    idse_developer_agent,
    communication_flows=communication_flows,
    name="IDSEDeveloperAgency",
    shared_instructions="shared_instructions.md",
    send_message_tool_class=SendMessageHandoff,
)

# Initialize CopilotKit adapter
adapter = CopilotAdapter(agency=agency)


def _runtime_manifest():
    """Runtime manifest used by CopilotKit clients to discover agents."""
    agent = {
        "id": "default",
        "name": "IDSE Developer Agent",
        "description": "Intent-Driven Systems Engineering assistant",
        "capabilities": ["chat"],
        "instructions": "You are the IDSE Developer Agent. Help users with IDSE pipeline, software delivery, and architecture.",
        "public": True,
    }
    agents_list = [agent]
    agents_map = {"default": agent}
    return {
        "protocol": "CopilotKit",
        "version": "1.0",
        "description": "Embeddable chat widget for IDSE Developer Agency",
        "endpoints": {
            "websocket": "/api/copilot/ws",
            "chat": "/api/copilot/chat",
            "stream": "/api/copilot/stream",
        },
        "features": [
            "Real-time WebSocket streaming",
            "HTTP chat endpoint",
            "Typing indicators",
            "Message history",
        ],
        # Provide agents in multiple shapes for compatibility with CopilotKit clients
        "agents": agents_map,  # CopilotKit runtime expects an object map
        "agents_list": agents_list,  # keep list form for any consumers that read arrays
        "agents__unsafe_dev_only": agents_list,
        "agents_map": agents_map,
        "agentsMap": agents_map,
        "defaultAgent": "default",
        "defaultAgentId": "default",
        "default_agent": "default",
        "default_agent_id": "default",
    }


@router.get("/")
async def copilot_info():
    """CopilotKit protocol information endpoint"""
    return _runtime_manifest()


@router.post("/")
async def copilot_info_post():
    """Accept POST for runtime sync compatibility."""
    return _runtime_manifest()


@router.get("/info")
async def copilot_info_alt():
    """Alias for CopilotKit runtime discovery."""
    return _runtime_manifest()


@router.websocket("/ws")
async def copilot_websocket(
    websocket: WebSocket,
    client_id: str = Query(default=None, description="Optional client identifier"),
):
    """
    WebSocket endpoint for real-time chat with CopilotKit widgets

    Supports:
    - Bidirectional communication
    - Streaming responses
    - Typing indicators
    - Connection management

    Query Parameters:
        client_id: Optional identifier for the client connection
    """
    if not client_id:
        client_id = str(uuid.uuid4())

    logger.info(f"CopilotKit WebSocket connection request from: {client_id}")

    await adapter.handle_websocket(websocket=websocket, client_id=client_id)


@router.post("/chat")
async def copilot_chat(payload: Dict[str, Any]):
    """
    HTTP POST endpoint for chat messages

    Accepts chat messages from CopilotKit widgets and returns
    responses from the IDSE Developer Agent.

    Request Body:
        message: User message text
        OR
        messages: Array of message objects
        OR
        text/content: Alternative message fields

    Returns:
        Response in CopilotKit format with assistant message
    """
    try:
        response = await adapter.handle_message(payload)
        return response

    except Exception as e:
        logger.error(f"CopilotKit chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def copilot_stream(payload: Dict[str, Any]):
    """
    HTTP streaming endpoint for progressive responses

    Similar to /chat but returns responses in chunks for
    better UX with loading indicators.

    This is a simplified streaming endpoint. For full streaming,
    use the WebSocket endpoint at /ws
    """
    try:
        chunks = []
        async for chunk in adapter.process_message_stream(payload):
            chunks.append(chunk)

        # Return all chunks (simplified streaming)
        return {
            "type": "stream_complete",
            "chunks": chunks,
            "total_chunks": len(chunks),
        }

    except Exception as e:
        logger.error(f"CopilotKit stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def copilot_status():
    """Check CopilotKit protocol status and active connections"""
    return {
        "protocol": "CopilotKit",
        "status": "operational",
        "adapter": "CopilotAdapter (custom)",
        "agent": "IDSE Developer Agent",
        "active_connections": len(adapter.active_connections),
        "connection_ids": list(adapter.active_connections.keys()),
    }


@router.get("/config")
async def copilot_config():
    """
    Get CopilotKit widget configuration

    Returns configuration that can be used by frontend
    CopilotKit widgets for initialization.
    """
    return {
        "apiUrl": "/api/copilot",
        "websocketUrl": "/api/copilot/ws",
        "agent": {
            "name": "IDSE Developer Agent",
            "description": "Intent-Driven Systems Engineering AI Assistant",
            "capabilities": [
                "Software development guidance",
                "IDSE pipeline assistance",
                "Code review and feedback",
                "Architecture planning",
            ],
        },
        "ui": {
            "theme": "light",
            "position": "bottom-right",
            "primaryColor": "#4F46E5",
        },
    }


@router.post("/feedback")
async def copilot_feedback(feedback: Dict[str, Any]):
    """
    Collect feedback from widget users

    Accepts feedback data from CopilotKit widgets for
    analytics and improvement tracking.
    """
    try:
        logger.info(f"CopilotKit feedback received: {feedback}")

        return {
            "status": "success",
            "message": "Feedback recorded",
            "feedback_id": str(uuid.uuid4()),
        }

    except Exception as e:
        logger.error(f"CopilotKit feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
