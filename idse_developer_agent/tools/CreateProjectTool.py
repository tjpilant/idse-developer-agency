from typing import Optional, Dict, Any

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class CreateProjectTool(BaseTool):
    """Creates a new project in Supabase via MCP sync endpoint."""

    # Identifiers used by Agency Swarm tooling
    name: str = "CreateProjectTool"
    description: str = "Create a new project in Supabase with initial artifacts."

    project_name: str = Field(
        ...,
        description="Name of the project to create.",
    )
    stack: str = Field(
        default="python",
        description="Technology stack (e.g., python, javascript, rust).",
    )
    framework: Optional[str] = Field(
        default=None,
        description="Framework used (e.g., agency-swarm, react, fastapi).",
    )
    artifacts: Dict[str, str] = Field(
        default_factory=dict,
        description="Initial artifacts as dict with keys like 'intent_md', 'context_md', etc.",
    )
    state_json: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Initial state JSON with stages and progress.",
    )

    def run(self):
        try:
            # Get backend URL from environment or use default
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."
            sync_url = f"{backend_url}/sync/push"
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            payload = {
                "project_name": self.project_name,
                "stack": self.stack,
                "framework": self.framework,
                "artifacts": self.artifacts,
                "state_json": self.state_json,
            }

            response = requests.post(sync_url, json=payload, headers=headers, timeout=30)

            if response.status_code == 200:
                result = response.json()
                project_id = result.get("project_id")
                message = result.get("message", "Project created successfully")
                synced_stages = result.get("synced_stages", [])

                return f"✅ {message}\n📋 Project ID: {project_id}\n📄 Synced stages: {', '.join(synced_stages)}"
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                return f"❌ Failed to create project: {response.status_code} - {error_detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check if backend is running at http://localhost:8000"
        except Exception as exc:
            logger.error(f"Error creating project: {exc}")
            return f"❌ Error creating project: {exc}"
