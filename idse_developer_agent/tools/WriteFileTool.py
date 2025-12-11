from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class WriteFileTool(BaseTool):
    """Writes content to a file at the given path, creating it if it doesn't exist."""

    # Identifiers used by Agency Swarm tooling
    name: str = "WriteFileTool"
    description: str = "Write or overwrite content to a file at the specified path."

    path: str = Field(
        ...,
        description="Absolute or workspace-relative path to the file to write.",
    )
    content: str = Field(
        ...,
        description="The text content to write to the file.",
    )
    create_dirs: bool = Field(
        default=True,
        description="If True, automatically create parent directories if they don't exist.",
    )

    def run(self):
        import os

        if not self.path:
            return "❌ Missing 'path' value"

        try:
            # Create parent directories if needed
            if self.create_dirs:
                dir_path = os.path.dirname(os.path.abspath(self.path))
                if dir_path:
                    os.makedirs(dir_path, exist_ok=True)

            with open(self.path, "w") as file_handle:
                file_handle.write(self.content)

            return f"✅ Successfully wrote {len(self.content)} characters to {self.path}"

        except Exception as exc:
            return f"❌ Error writing file: {exc}"
