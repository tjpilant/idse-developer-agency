from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class ReadFileTool(BaseTool):
    """Reads and returns the contents of a text file at the given path."""

    # Identifiers used by Agency Swarm tooling
    name: str = "ReadFileTool"
    description: str = "Read the contents of a local text file given its path."

    path: Optional[str] = Field(
        default=None,
        description="Absolute or workspace-relative path to the text file to read.",
    )

    def run(self):
        if not self.path:
            return "❌ Missing 'path' value"
        try:
            with open(self.path, "r") as file_handle:
                return file_handle.read()
        except Exception as exc:
            return f"❌ Error reading file: {exc}"
