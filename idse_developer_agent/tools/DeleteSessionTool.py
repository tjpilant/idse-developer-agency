from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class DeleteSessionTool(BaseTool):
    """Deletes a session from a project in Supabase."""

    # Identifiers used by Agency Swarm tooling
    name: str = "DeleteSessionTool"
    description: str = "Delete a session and its documents from a project in Supabase."

    project_id: str = Field(
        ...,
        description="UUID of the project containing the session.",
    )
    session_id: str = Field(
        ...,
        description="Session ID to delete (e.g., 'puck-components', '__blueprint__').",
    )
    force: bool = Field(
        default=False,
        description="Force deletion even if it's a blueprint session (__blueprint__).",
    )

    def run(self):
        try:
            # Get backend URL from environment or use default
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."
            delete_url = f"{backend_url}/sync/sessions/{self.project_id}/{self.session_id}"
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            params = {"force": self.force} if self.force else {}
            response = requests.delete(delete_url, params=params, headers=headers, timeout=30)

            if response.status_code == 200:
                result = response.json()
                message = result.get("message", "Session deleted successfully")
                project_id = result.get("project_id")
                session_id = result.get("session_id")

                return f"✅ {message}\n📋 Project: {project_id}\n📄 Session: {session_id}"

            elif response.status_code == 400:
                # Handle blueprint protection
                error_detail = response.json().get("detail", "Bad request")
                if "blueprint" in error_detail.lower():
                    return f"❌ {error_detail}\n💡 Use force=true to delete blueprint sessions."
                return f"❌ Bad request: {error_detail}"

            elif response.status_code == 404:
                error_detail = response.json().get("detail", "Not found")
                return f"❌ Session not found: {error_detail}"

            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                return f"❌ Failed to delete session: {response.status_code} - {error_detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check if backend is running at http://localhost:8000"
        except Exception as exc:
            logger.error(f"Error deleting session: {exc}")
            return f"❌ Error deleting session: {exc}"
