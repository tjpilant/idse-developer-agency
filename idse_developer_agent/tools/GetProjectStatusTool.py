from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class GetProjectStatusTool(BaseTool):
    """Gets status and metadata for a project or specific session."""

    # Identifiers used by Agency Swarm tooling
    name: str = "GetProjectStatusTool"
    description: str = "Get status, progress, and metadata for a project or specific session in Supabase."

    project_id: str = Field(
        ...,
        description="UUID of the project to check.",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Optional session ID to get specific session status (e.g., 'puck-components', '__blueprint__').",
    )

    def run(self):
        try:
            # Get backend URL from environment or use default
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            if self.session_id:
                # Get specific session status
                status_url = f"{backend_url}/sync/status/{self.project_id}/{self.session_id}"
            else:
                # Get project status
                status_url = f"{backend_url}/sync/status/{self.project_id}"

            response = requests.get(status_url, headers=headers, timeout=30)

            if response.status_code == 200:
                result = response.json()

                if self.session_id:
                    # Session-specific response
                    project_name = result.get("project_name", "Unknown")
                    session_name = result.get("session_name", "Unknown")
                    is_blueprint = result.get("is_blueprint", False)
                    last_synced = result.get("last_synced", "Unknown")
                    created_at = result.get("created_at", "Unknown")
                    state = result.get("state", {})
                    last_agent = result.get("last_agent", "Unknown")
                    progress_percent = result.get("progress_percent", 0)

                    output = [
                        f"📋 Session Status for {project_name}",
                        f"📄 Session: {session_name} ({self.session_id})",
                        f"🔵 Blueprint: {'Yes' if is_blueprint else 'No'}",
                        f"📊 Progress: {progress_percent}%",
                        f"🤖 Last Agent: {last_agent}",
                        f"⏰ Last Synced: {last_synced}",
                        f"🕐 Created: {created_at}",
                        f"📝 Stages:"
                    ]

                    if state:
                        for stage, status in state.items():
                            status_emoji = "✅" if status in ["complete", "completed"] else "🔄" if status == "in_progress" else "⏸️"
                            output.append(f"   {status_emoji} {stage}: {status}")
                    else:
                        output.append("   No stage information available")

                else:
                    # Project-level response
                    project_name = result.get("project_name", "Unknown")
                    last_synced = result.get("last_synced", "Unknown")
                    created_at = result.get("created_at", "Unknown")
                    state = result.get("state", {})
                    last_agent = result.get("last_agent", "Unknown")

                    output = [
                        f"📋 Project Status: {project_name}",
                        f"🆔 Project ID: {self.project_id}",
                        f"🤖 Last Agent: {last_agent}",
                        f"⏰ Last Synced: {last_synced}",
                        f"🕐 Created: {created_at}",
                        f"📝 Stages:"
                    ]

                    if state:
                        for stage, status in state.items():
                            status_emoji = "✅" if status in ["complete", "completed"] else "🔄" if status == "in_progress" else "⏸️"
                            output.append(f"   {status_emoji} {stage}: {status}")
                    else:
                        output.append("   No stage information available")

                return "\n".join(output)

            elif response.status_code == 404:
                error_detail = response.json().get("detail", "Not found")
                return f"❌ {error_detail}"

            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                return f"❌ Failed to get status: {response.status_code} - {error_detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check if backend is running at http://localhost:8000"
        except Exception as exc:
            logger.error(f"Error getting status: {exc}")
            return f"❌ Error getting status: {exc}"
