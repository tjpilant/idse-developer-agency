"""
Agency Swarm tool for committing IDSE artifacts to GitHub.

Integrates with git_service to automatically commit session-scoped artifacts
and trigger repository_dispatch events for CI/CD validation.
"""

from typing import List, Optional
from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
from pathlib import Path


class CommitArtifactsTool(BaseTool):
    """
    Commits IDSE session artifacts to GitHub repository.

    Automatically includes session metadata and triggers repository_dispatch
    for CI validation workflows.
    """

    name: str = "CommitArtifactsTool"
    description: str = (
        "Commit IDSE artifacts (specs, plans, tasks) to GitHub repository. "
        "Automatically triggers CI validation via repository_dispatch webhook."
    )

    session_id: str = Field(
        ...,
        description="Session identifier (e.g., 'Puck_Components', 'session-1765806980')"
    )

    project: str = Field(
        ...,
        description="Project name (e.g., 'IDSE_Core', 'Project_Status_Browser')"
    )

    file_paths: List[str] = Field(
        ...,
        description=(
            "List of file paths to commit (relative to repo root). "
            "Example: ['projects/IDSE_Core/sessions/Puck_Components/specs/spec.md']"
        )
    )

    commit_message: Optional[str] = Field(
        default=None,
        description="Custom commit message (auto-generated if not provided)"
    )

    branch: Optional[str] = Field(
        default=None,
        description="Target branch (defaults to main/default branch)"
    )

    trigger_dispatch: bool = Field(
        default=True,
        description="Whether to trigger repository_dispatch event for CI validation"
    )
    auth_token: Optional[str] = Field(
        default=None,
        description="One-time GitHub token (PAT or installation token). The tool does not store or echo this value."
    )
    auth_mode: Optional[str] = Field(
        default=None,
        description="Override auth mode ('pat' or 'app'). Defaults to backend env configuration."
    )

    def run(self) -> str:
        """Execute git commit via backend API."""
        try:
            # Read file contents
            files = []
            for file_path in self.file_paths:
                full_path = Path(file_path)

                if not full_path.exists():
                    return f"❌ File not found: {file_path}"

                content = full_path.read_text(encoding='utf-8')
                files.append({
                    "path": file_path,
                    "content": content
                })

            # Call backend git API
            api_url = os.getenv("AGENCY_API_URL", "http://localhost:8000")
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"

            payload = {
                "session_id": self.session_id,
                "project": self.project,
                "files": files,
                "message": self.commit_message,
                "branch": self.branch,
                "trigger_dispatch": self.trigger_dispatch,
                "auth_mode": self.auth_mode,
            }

            response = requests.post(
                f"{api_url}/api/git/commit",
                json=payload,
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                commit_sha = result.get("commit_sha", "unknown")[:7]
                commit_url = result.get("commit_url", "")
                files_count = result.get("files_committed", 0)
                branch = result.get("branch", "unknown")

                output = f"✅ Successfully committed {files_count} file(s) to {branch}\n"
                output += f"   Commit: {commit_sha}\n"
                output += f"   URL: {commit_url}\n"

                if self.trigger_dispatch and result.get("dispatch"):
                    dispatch_result = result["dispatch"]
                    if dispatch_result.get("success"):
                        output += f"   ✓ Triggered repository_dispatch (event: {dispatch_result.get('event_type')})\n"
                    else:
                        output += f"   ⚠️  Failed to trigger dispatch: {dispatch_result.get('error')}\n"

                return output
            else:
                error_detail = response.json().get("detail", "Unknown error")
                return f"❌ Commit failed: {error_detail}"

        except requests.exceptions.ConnectionError:
            return (
                "❌ Cannot connect to Agency backend API. "
                "Ensure backend is running at http://localhost:8000"
            )
        except Exception as e:
            return f"❌ Error committing artifacts: {str(e)}"


# Example usage in agent instructions:
"""
To commit your generated artifacts:

1. Generate your spec/plan/tasks as usual
2. Use CommitArtifactsTool:
   - session_id: Current session (from .idse_active_session.json)
   - project: Current project name
   - file_paths: List of files you created/modified
   - trigger_dispatch: true (for CI validation)

Example:
{
    "session_id": "Puck_Components",
    "project": "IDSE_Core",
    "file_paths": [
        "projects/IDSE_Core/sessions/Puck_Components/specs/spec.md",
        "projects/IDSE_Core/sessions/Puck_Components/plans/plan.md"
    ],
    "trigger_dispatch": true
}

The tool will:
- Read file contents
- Commit to GitHub
- Trigger repository_dispatch for CI validation
- Return commit URL and SHA
"""
