from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class ListDirectoryTool(BaseTool):
    """Lists files and directories at the given path."""

    # Identifiers used by Agency Swarm tooling
    name: str = "ListDirectoryTool"
    description: str = "List all files and directories in a specified directory path."

    path: str = Field(
        default=".",
        description="Absolute or workspace-relative path to the directory to list.",
    )
    show_hidden: bool = Field(
        default=False,
        description="If True, include hidden files (starting with '.').",
    )

    def run(self):
        import os

        if not self.path:
            return "❌ Missing 'path' value"

        try:
            if not os.path.exists(self.path):
                return f"❌ Directory not found: {self.path}"

            if not os.path.isdir(self.path):
                return f"❌ Path is not a directory: {self.path}"

            entries = os.listdir(self.path)

            if not self.show_hidden:
                entries = [e for e in entries if not e.startswith('.')]

            entries.sort()

            # Separate files and directories
            files = []
            dirs = []

            for entry in entries:
                full_path = os.path.join(self.path, entry)
                if os.path.isdir(full_path):
                    dirs.append(f"📁 {entry}/")
                else:
                    size = os.path.getsize(full_path)
                    files.append(f"📄 {entry} ({size} bytes)")

            result = f"Contents of {self.path}:\n\n"
            if dirs:
                result += "Directories:\n" + "\n".join(dirs) + "\n\n"
            if files:
                result += "Files:\n" + "\n".join(files)

            if not dirs and not files:
                result += "(empty directory)"

            return result

        except Exception as exc:
            return f"❌ Error listing directory: {exc}"
