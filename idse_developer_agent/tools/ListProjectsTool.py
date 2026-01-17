from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class ListProjectsTool(BaseTool):
    """Lists all projects in Supabase."""

    # Identifiers used by Agency Swarm tooling
    name: str = "ListProjectsTool"
    description: str = "List all projects in Supabase with their status and metadata."

    limit: Optional[int] = Field(
        default=None,
        description="Maximum number of projects to return (optional).",
    )

    def run(self):
        try:
            # Get backend URL from environment or use default
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."
            projects_url = f"{backend_url}/sync/projects"
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            response = requests.get(projects_url, headers=headers, timeout=30)

            if response.status_code == 200:
                result = response.json()
                projects = result.get("projects", [])
                count = result.get("count", 0)

                if not projects:
                    return "📭 No projects found in Supabase."

                # Limit results if specified
                if self.limit:
                    projects = projects[:self.limit]

                output = [f"📋 Found {count} projects:\n"]

                for project in projects:
                    project_id = project.get("id", "Unknown")
                    name = project.get("name", "Unnamed")
                    stack = project.get("stack", "Unknown")
                    framework = project.get("framework") or "None"
                    updated_at = project.get("updated_at", "Unknown")

                    # Extract state information if available
                    state_json = project.get("state_json", {}) or {}
                    stages = state_json.get("stages", {})
                    last_agent = state_json.get("last_agent", "Unknown")
                    progress = state_json.get("progress_percent", 0)

                    output.append(
                        f"🔹 {name} ({project_id[:8]}...)\n"
                        f"   Stack: {stack} | Framework: {framework}\n"
                        f"   Progress: {progress}% | Last Agent: {last_agent}\n"
                        f"   Updated: {updated_at}\n"
                        f"   Stages: {dict(stages)}\n"
                    )

                return "\n".join(output)

            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                return f"❌ Failed to list projects: {response.status_code} - {error_detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check if backend is running at http://localhost:8000"
        except Exception as exc:
            logger.error(f"Error listing projects: {exc}")
            return f"❌ Error listing projects: {exc}"
