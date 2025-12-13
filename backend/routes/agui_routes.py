"""
AG-UI Protocol Routes

Provides AG-UI protocol endpoints for admin interfaces.
Uses the built-in AguiAdapter from Agency Swarm.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

# AG-UI adapter is built into Agency Swarm
try:
    from agency_swarm.ui.core.agui_adapter import AguiAdapter
except ImportError:
    raise ImportError(
        "ag-ui-protocol not installed. Run: pip install ag-ui-protocol"
    )

from agency_swarm import Agency
from idse_developer_agent import idse_developer_agent

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize AG-UI adapter
adapter = AguiAdapter()

# Create agency instance for AG-UI interactions
agency = Agency(
    idse_developer_agent,
    communication_flows=[],
    name="IDSEDeveloperAgency",
    shared_instructions="shared_instructions.md",
)


@router.get("/")
async def agui_info():
    """AG-UI protocol information endpoint"""
    return {
        "protocol": "AG-UI",
        "version": "1.0",
        "description": "Admin interface for IDSE Developer Agency",
        "endpoints": {
            "events": "/admin/ag-ui/events",
            "messages": "/admin/ag-ui/messages",
            "chat": "/admin/ag-ui/chat",
        },
    }


@router.post("/events")
async def agui_events(event: Dict[str, Any]):
    """
    Process AG-UI protocol events

    Converts OpenAI Agents SDK events to AG-UI protocol format
    for admin dashboard visualization.
    """
    try:
        run_id = event.get("run_id")
        if not run_id:
            raise HTTPException(status_code=400, detail="Missing run_id in event")

        # Convert event using built-in adapter
        agui_event = adapter.openai_to_agui_events(
            event=event,
            run_id=run_id,
        )

        return {
            "status": "success",
            "run_id": run_id,
            "event": agui_event,
        }

    except Exception as e:
        logger.error(f"AG-UI event processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/messages")
async def agui_messages(payload: Dict[str, Any]):
    """
    Convert AG-UI messages to chat history

    Processes AG-UI protocol messages and converts them to
    Agency Swarm compatible format.
    """
    try:
        message_list = payload.get("messages", [])

        # Convert AG-UI messages to chat history
        chat_history = adapter.agui_messages_to_chat_history(message_list)

        return {
            "status": "success",
            "chat_history": chat_history,
            "message_count": len(chat_history),
        }

    except Exception as e:
        logger.error(f"AG-UI message conversion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def agui_chat(payload: Dict[str, Any]):
    """
    Process chat messages through AG-UI protocol

    Accepts chat messages, processes them through the IDSE Developer Agent,
    and returns responses in AG-UI format.
    """
    try:
        user_message = payload.get("message")
        if not user_message:
            raise HTTPException(status_code=400, detail="Missing message in payload")

        # Get response from agency
        response = agency.get_response_sync(user_message)

        return {
            "status": "success",
            "message": user_message,
            "response": response,
        }

    except Exception as e:
        logger.error(f"AG-UI chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def agui_status():
    """Check AG-UI protocol status"""
    return {
        "protocol": "AG-UI",
        "status": "operational",
        "adapter": "AguiAdapter (built-in)",
        "agent": "IDSE Developer Agent",
    }
