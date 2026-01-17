from typing import Optional, Dict

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class UpdateSessionStateTool(BaseTool):
    """Updates session state and progress in Supabase."""

    # Identifiers used by Agency Swarm tooling
    name: str = "UpdateSessionStateTool"
    description: str = "Update session state, progress, and last agent in Supabase."

    project_id: str = Field(
        ...,
        description="UUID of the project containing the session (project name allowed; will be resolved).",
    )
    session_id: str = Field(
        ...,
        description="Session ID to update (e.g., 'puck-components', '__blueprint__').",
    )
    stages: Optional[Dict[str, str]] = Field(
        default=None,
        description="Stage updates as dict like {'intent': 'complete', 'context': 'in_progress'}. Valid stages: intent, context, spec, plan, tasks, implementation, feedback. Valid statuses: pending, in_progress, complete, completed.",
    )
    last_agent: Optional[str] = Field(
        default=None,
        description="Name of the last agent that worked on this session.",
    )
    progress_percent: Optional[int] = Field(
        default=None,
        description="Progress percentage (0-100). If not provided, auto-calculated from stages.",
    )

    def run(self):
        try:
            # Validate inputs
            if self.stages:
                valid_stages = {"intent", "context", "spec", "plan", "tasks", "implementation", "feedback"}
                valid_statuses = {"pending", "in_progress", "complete", "completed"}

                for stage, status in self.stages.items():
                    if stage not in valid_stages:
                        return f"❌ Invalid stage name: {stage}. Valid stages: {', '.join(valid_stages)}"
                    if status not in valid_statuses:
                        return f"❌ Invalid status for {stage}: {status}. Valid statuses: {', '.join(valid_statuses)}"

            if self.progress_percent is not None:
                if not (0 <= self.progress_percent <= 100):
                    return "❌ progress_percent must be between 0 and 100"

            # Get backend URL from environment or use default
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            # Resolve project id if name provided
            resolved_project_id = self.project_id
            # Simple heuristic: if it doesn't look like a UUID (no dashes or too short), try resolving by name
            if len(resolved_project_id) < 20 or resolved_project_id.count("-") < 4:
                try:
                    projects_url = f"{backend_url}/sync/projects"
                    resp = requests.get(projects_url, headers=headers, timeout=10)
                    if resp.status_code == 200:
                        data = resp.json()
                        for proj in data.get("projects", []):
                            if proj.get("name") == self.project_id:
                                resolved_project_id = proj.get("id", resolved_project_id)
                                break
                except Exception as _:
                    # fall back to provided value if lookup fails
                    pass

            update_url = f"{backend_url}/sync/status/{resolved_project_id}/{self.session_id}"
            # reuse headers (already set)

            payload = {}
            if self.stages is not None:
                payload["stages"] = self.stages
            if self.last_agent is not None:
                payload["last_agent"] = self.last_agent
            if self.progress_percent is not None:
                payload["progress_percent"] = self.progress_percent

            if not payload:
                return "❌ No updates provided. Specify at least one of: stages, last_agent, progress_percent"

            response = requests.put(update_url, json=payload, headers=headers, timeout=30)

            if response.status_code == 200:
                result = response.json()
                project_id = result.get("project_id")
                session_id = result.get("session_id")
                updated_fields = result.get("updated_fields", [])
                timestamp = result.get("timestamp", "Unknown")

                return f"✅ Session state updated successfully\n📋 Project: {project_id}\n📄 Session: {session_id}\n🔄 Updated: {', '.join(updated_fields)}\n⏰ Timestamp: {timestamp}"

            elif response.status_code == 400:
                error_detail = response.json().get("detail", "Bad request")
                return f"❌ Bad request: {error_detail}"

            elif response.status_code == 404:
                error_detail = response.json().get("detail", "Not found")
                return f"❌ Session not found: {error_detail}"

            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                return f"❌ Failed to update session state: {response.status_code} - {error_detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check if backend is running at http://localhost:8000"
        except Exception as exc:
            logger.error(f"Error updating session state: {exc}")
            return f"❌ Error updating session state: {exc}"
