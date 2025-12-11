from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class CreateDirectoryTool(BaseTool):
    """Creates a directory at the given path."""

    # Identifiers used by Agency Swarm tooling
    name: str = "CreateDirectoryTool"
    description: str = "Create a new directory at the specified path."

    path: str = Field(
        ...,
        description="Absolute or workspace-relative path to the directory to create.",
    )
    parents: bool = Field(
        default=True,
        description="If True, create parent directories as needed (like 'mkdir -p').",
    )

    def run(self):
        import os

        if not self.path:
            return "❌ Missing 'path' value"

        try:
            if os.path.exists(self.path):
                if os.path.isdir(self.path):
                    return f"⚠️ Directory already exists: {self.path}"
                else:
                    return f"❌ Path exists but is not a directory: {self.path}"

            if self.parents:
                os.makedirs(self.path, exist_ok=True)
            else:
                os.mkdir(self.path)

            return f"✅ Successfully created directory: {self.path}"

        except Exception as exc:
            return f"❌ Error creating directory: {exc}"
