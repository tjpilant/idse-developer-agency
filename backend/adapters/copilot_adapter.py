"""
CopilotKit Protocol Adapter

Bridges between CopilotKit protocol and Agency Swarm.
Enables embeddable chat widgets to communicate with IDSE Developer Agent.
"""

from fastapi import WebSocket, WebSocketDisconnect
from agency_swarm import Agency
from typing import Dict, Any, AsyncGenerator
import json
import logging
import asyncio
from typing import Optional

logger = logging.getLogger(__name__)

MAX_RESPONSE_CHARS = 1200  # hard cap to avoid runaway rambles
STREAM_CHUNK_SIZE = 80     # characters per streamed chunk
RESPONSE_TIMEOUT_SEC = 60  # safety timeout per request


class CopilotAdapter:
    """
    Adapter between CopilotKit protocol and Agency Swarm

    Handles:
    - WebSocket connections for real-time chat
    - Message format conversion
    - Streaming responses
    - Session management
    """

    def __init__(self, agency: Agency):
        """
        Initialize CopilotKit adapter

        Args:
            agency: Agency Swarm agency instance
        """
        self.agency = agency
        self.active_connections: Dict[str, WebSocket] = {}
        logger.info("CopilotAdapter initialized")

    async def handle_websocket(self, websocket: WebSocket, client_id: str = None):
        """
        Handle WebSocket connection for CopilotKit chat widget

        Args:
            websocket: FastAPI WebSocket connection
            client_id: Optional client identifier
        """
        await websocket.accept()

        if client_id:
            self.active_connections[client_id] = websocket

        logger.info(f"WebSocket connected: {client_id or 'anonymous'}")

        try:
            while True:
                # Receive message from CopilotKit widget
                data = await websocket.receive_json()
                logger.debug(f"Received: {data}")

                # Process message and stream response
                async for response_chunk in self.process_message_stream(data):
                    await websocket.send_json(response_chunk)

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {client_id or 'anonymous'}")
            if client_id and client_id in self.active_connections:
                del self.active_connections[client_id]

        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            await websocket.close(code=1011, reason=str(e))
            if client_id and client_id in self.active_connections:
                del self.active_connections[client_id]

    async def handle_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle HTTP POST message from CopilotKit

        Args:
            message_data: Message payload from CopilotKit

        Returns:
            Response in CopilotKit format
        """
        try:
            user_message = self.extract_user_message(message_data)

            response = await self._get_response_with_timeout(user_message)

            # Convert to CopilotKit format
            return self.format_copilot_response(response, message_data)

        except Exception as e:
            logger.error(f"Message handling error: {e}")
            return self.format_error_response(str(e))

    async def process_message_stream(
        self, message_data: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process message and yield streaming response chunks

        Args:
            message_data: Message from CopilotKit

        Yields:
            Response chunks in CopilotKit streaming format
        """
        try:
            user_message = self.extract_user_message(message_data)

            # Send typing indicator
            yield self.format_typing_indicator(True)

            response = await self._get_response_with_timeout(user_message)

            # Send response in chunks for streaming effect
            yield self.format_typing_indicator(False)

            # Split response into chunks for streaming
            for i in range(0, len(response), STREAM_CHUNK_SIZE):
                chunk = response[i:i + STREAM_CHUNK_SIZE]
                yield self.format_response_chunk(chunk, is_final=(i + STREAM_CHUNK_SIZE >= len(response)))
                await asyncio.sleep(0.05)  # Small delay for smooth streaming

        except Exception as e:
            logger.error(f"Stream processing error: {e}")
            yield self.format_error_response(str(e))

    def extract_user_message(self, message_data: Dict[str, Any]) -> str:
        """
        Extract user message from CopilotKit payload

        Args:
            message_data: Raw message data from CopilotKit

        Returns:
            Extracted user message string
        """
        # CopilotKit sends messages in different formats
        # Try multiple paths to extract the message
        if "message" in message_data:
            return message_data["message"]
        elif "messages" in message_data and len(message_data["messages"]) > 0:
            last_message = message_data["messages"][-1]
            if isinstance(last_message, dict):
                return last_message.get("content", last_message.get("text", ""))
            return str(last_message)
        elif "text" in message_data:
            return message_data["text"]
        elif "content" in message_data:
            return message_data["content"]

        logger.warning(f"Could not extract message from: {message_data}")
        return ""

    async def _get_response_with_timeout(self, user_message: str) -> str:
        """
        Fetch response from agency with timeout and truncation to avoid runaway output.
        """
        try:
            raw = await asyncio.wait_for(
                asyncio.to_thread(self.agency.get_response_sync, user_message),
                timeout=RESPONSE_TIMEOUT_SEC,
            )
            text = str(raw) if raw is not None else ""
            if len(text) > MAX_RESPONSE_CHARS:
                text = text[:MAX_RESPONSE_CHARS] + "…"
            return text
        except asyncio.TimeoutError:
            logger.error("Agency response timed out")
            return "⏱️ Response timed out. Please try again with a shorter request."
        except Exception as exc:
            logger.error(f"Agency response error: {exc}")
            return f"⚠️ Error: {exc}"

    def format_copilot_response(
        self, response: str, original_message: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Format Agency Swarm response for CopilotKit

        Args:
            response: Response from Agency Swarm
            original_message: Original message data for context

        Returns:
            Response in CopilotKit format
        """
        return {
            "type": "message",
            "role": "assistant",
            "content": response,
            "timestamp": self._get_timestamp(),
            "metadata": {
                "agent": "IDSE Developer Agent",
                "protocol": "copilotkit",
            },
        }

    def format_response_chunk(self, chunk: str, is_final: bool = False) -> Dict[str, Any]:
        """
        Format response chunk for streaming

        Args:
            chunk: Text chunk to send
            is_final: Whether this is the final chunk

        Returns:
            Streaming chunk in CopilotKit format
        """
        return {
            "type": "chunk",
            "delta": chunk,
            "is_final": is_final,
            "timestamp": self._get_timestamp(),
        }

    def format_typing_indicator(self, is_typing: bool) -> Dict[str, Any]:
        """
        Format typing indicator event

        Args:
            is_typing: Whether agent is typing

        Returns:
            Typing indicator in CopilotKit format
        """
        return {
            "type": "typing",
            "is_typing": is_typing,
            "timestamp": self._get_timestamp(),
        }

    def format_error_response(self, error_message: str) -> Dict[str, Any]:
        """
        Format error response for CopilotKit

        Args:
            error_message: Error description

        Returns:
            Error response in CopilotKit format
        """
        return {
            "type": "error",
            "error": error_message,
            "timestamp": self._get_timestamp(),
        }

    @staticmethod
    def _get_timestamp() -> str:
        """Get current ISO timestamp"""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()
