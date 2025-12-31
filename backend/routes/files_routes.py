"""
File tree listing endpoint for MD Editor file browser.
Provides recursive directory listing with smart exclusions.
"""

from fastapi import APIRouter
from pathlib import Path
from typing import List, Dict, Any

router = APIRouter(prefix="/files", tags=["files"])

# Directories to exclude from file tree
EXCLUDED_DIRS = {
    "node_modules",
    ".git",
    ".vscode",
    ".cursor",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    "venv",
    ".venv",
    ".next",
    "coverage",
}

# Files to exclude
EXCLUDED_FILES = {
    ".DS_Store",
    "Thumbs.db",
    ".gitignore",
    ".env",
    ".env.local",
}


def build_file_tree(
    dir_path: Path,
    relative_path: str = "",
    max_depth: int = 10,
    current_depth: int = 0,
) -> List[Dict[str, Any]]:
    """
    Recursively build a file tree structure.

    Args:
        dir_path: Absolute path to directory
        relative_path: Relative path from workspace root
        max_depth: Maximum recursion depth
        current_depth: Current recursion level

    Returns:
        List of file/folder nodes
    """
    if current_depth >= max_depth:
        return []

    try:
        entries = sorted(dir_path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        nodes = []

        for entry in entries:
            name = entry.name

            # Skip excluded files/dirs
            if name in EXCLUDED_DIRS or name in EXCLUDED_FILES:
                continue

            # Skip hidden files (except .owner, .collaborators for debugging)
            if name.startswith(".") and name not in {".owner", ".collaborators"}:
                continue

            rel_path = f"{relative_path}/{name}" if relative_path else name

            if entry.is_dir():
                children = build_file_tree(
                    entry,
                    rel_path,
                    max_depth,
                    current_depth + 1,
                )

                # Only include folders that have children
                if children:
                    nodes.append({
                        "name": name,
                        "path": rel_path,
                        "type": "folder",
                        "children": children,
                    })
            elif entry.is_file():
                # Include all files (not just .md like Milkdown service)
                nodes.append({
                    "name": name,
                    "path": rel_path,
                    "type": "file",
                })

        return nodes
    except PermissionError:
        return []


@router.get("/tree")
async def get_file_tree() -> List[Dict[str, Any]]:
    """
    Get complete repository file tree.

    Returns JSON structure suitable for TreeView component.
    Excludes common build/dependency directories.
    """
    workspace_root = Path.cwd()
    tree = build_file_tree(workspace_root)
    return tree
