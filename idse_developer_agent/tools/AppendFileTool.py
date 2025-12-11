from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class AppendFileTool(BaseTool):
    """Appends content to an existing file or creates it if it doesn't exist."""

    # Identifiers used by Agency Swarm tooling
    name: str = "AppendFileTool"
    description: str = "Append content to the end of a file at the specified path."

    path: str = Field(
        ...,
        description="Absolute or workspace-relative path to the file to append to.",
    )
    content: str = Field(
        ...,
        description="The text content to append to the file.",
    )
    newline: bool = Field(
        default=True,
        description="If True, adds a newline before appending content.",
    )

    def run(self):
        import os

        if not self.path:
            return "❌ Missing 'path' value"

        try:
            # Create parent directories if needed
            dir_path = os.path.dirname(os.path.abspath(self.path))
            if dir_path:
                os.makedirs(dir_path, exist_ok=True)

            # Check if file exists and has content
            file_exists = os.path.exists(self.path) and os.path.getsize(self.path) > 0

            with open(self.path, "a") as file_handle:
                if self.newline and file_exists:
                    file_handle.write("\n")
                file_handle.write(self.content)

            return f"✅ Successfully appended {len(self.content)} characters to {self.path}"

        except Exception as exc:
            return f"❌ Error appending to file: {exc}"
