from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class DeleteFileTool(BaseTool):
    """Deletes a file at the given path."""

    # Identifiers used by Agency Swarm tooling
    name: str = "DeleteFileTool"
    description: str = "Delete a file at the specified path. Use with caution!"

    path: str = Field(
        ...,
        description="Absolute or workspace-relative path to the file to delete.",
    )

    def run(self):
        import os

        if not self.path:
            return "❌ Missing 'path' value"

        try:
            if not os.path.exists(self.path):
                return f"❌ File not found: {self.path}"

            if os.path.isdir(self.path):
                return f"❌ Path is a directory, not a file: {self.path}"

            os.remove(self.path)
            return f"✅ Successfully deleted {self.path}"

        except Exception as exc:
            return f"❌ Error deleting file: {exc}"
