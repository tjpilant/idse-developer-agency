"""
Project Manager

Handles IDSE project initialization, directory creation, and metadata management.
"""

import os
from pathlib import Path
from datetime import datetime
from typing import Optional
import json


class ProjectManager:
    """Manages IDSE project lifecycle operations."""

    def __init__(self, workspace_root: Optional[Path] = None):
        """
        Initialize ProjectManager.

        Args:
            workspace_root: Root directory for .idse/ folder. Defaults to current directory.
        """
        self.workspace_root = workspace_root or Path.cwd()
        self.idse_root = self.workspace_root / ".idse"
        self.projects_root = self.idse_root / "projects"

    def init_project(self, project_name: str, stack: str, client_id: Optional[str] = None) -> Path:
        """
        Initialize a new IDSE project with full directory structure.

        Args:
            project_name: Name of the project
            stack: Technology stack (python, node, go, etc.)
            client_id: Optional client ID from Agency Core

        Returns:
            Path to created project directory

        Raises:
            ValueError: If project already exists
        """
        project_path = self.projects_root / project_name

        if project_path.exists():
            raise ValueError(f"Project '{project_name}' already exists at {project_path}")

        # Create project structure
        session_id = f"session-{int(datetime.now().timestamp())}"
        session_path = project_path / "sessions" / session_id

        # Create all directories
        dirs_to_create = [
            session_path / "intents",
            session_path / "contexts",
            session_path / "specs",
            session_path / "plans",
            session_path / "tasks",
            session_path / "implementation",
            session_path / "feedback",
            session_path / "metadata",
        ]

        for dir_path in dirs_to_create:
            dir_path.mkdir(parents=True, exist_ok=True)

        # Load and populate templates
        from .template_loader import TemplateLoader

        loader = TemplateLoader()
        artifacts = loader.load_all_templates(project_name=project_name, stack=stack)

        # Write artifacts
        artifact_map = {
            "intent.md": session_path / "intents" / "intent.md",
            "context.md": session_path / "contexts" / "context.md",
            "spec.md": session_path / "specs" / "spec.md",
            "plan.md": session_path / "plans" / "plan.md",
            "tasks.md": session_path / "tasks" / "tasks.md",
            "feedback.md": session_path / "feedback" / "feedback.md",
            "implementation_readme.md": session_path / "implementation" / "README.md",
        }

        for template_name, file_path in artifact_map.items():
            if template_name in artifacts:
                file_path.write_text(artifacts[template_name])

        # Create .owner metadata file
        owner_file = session_path / "metadata" / ".owner"
        owner_file.write_text(f"Created: {datetime.now().isoformat()}\n")
        if client_id:
            with owner_file.open("a") as f:
                f.write(f"Client ID: {client_id}\n")

        # Create CURRENT_SESSION pointer
        current_session_file = project_path / "CURRENT_SESSION"
        current_session_file.write_text(session_id)

        # Initialize session_state.json
        from .state_tracker import StateTracker

        tracker = StateTracker(project_path)
        tracker.init_state(project_name, session_id)

        return project_path

    def get_current_project(self) -> Optional[Path]:
        """
        Detect current project from workspace.

        Returns:
            Path to current project, or None if not in an IDSE project
        """
        # Look for .idse directory in current path hierarchy
        current = Path.cwd()

        while current != current.parent:
            idse_path = current / ".idse"
            if idse_path.exists():
                # Find which project we're in by checking subdirectories
                projects = list((idse_path / "projects").iterdir())
                if projects:
                    # Return first project (could be smarter with git or cwd context)
                    return projects[0]
            current = current.parent

        return None

    def get_current_session(self, project_path: Path) -> str:
        """
        Get current session ID from CURRENT_SESSION file.

        Args:
            project_path: Path to project directory

        Returns:
            Session ID string
        """
        current_session_file = project_path / "CURRENT_SESSION"
        if not current_session_file.exists():
            raise FileNotFoundError(f"No CURRENT_SESSION file in {project_path}")

        return current_session_file.read_text().strip()
