from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Literal, Optional

from SessionManager import SessionManager

StageName = Literal["intent", "context", "spec", "plan", "tasks"]

STAGE_TO_DIR = {
    "intent": "intents",
    "context": "contexts",
    "spec": "specs",
    "plan": "plans",
    "tasks": "tasks",
}


def ensure_project(project: Optional[str]) -> None:
    """
    Switch to the requested project if it differs from the active one.
    """
    if not project:
        return
    meta = SessionManager.get_active_session()
    if meta.project != project:
        SessionManager.switch_project(project)


def resolve_output_path(
    stage: StageName | str = "context",
    filename: str = "scraper_output.md",
    output_path: Optional[str] = None,
) -> Path:
    """
    Resolve a session-scoped output path, defaulting to the stage directory.
    """
    if output_path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        return path
    target_stage = (stage or "context").lower()
    stage_dir = STAGE_TO_DIR.get(target_stage, "contexts")
    return SessionManager.build_path(stage_dir, filename)


def render_header(source: str, url: str) -> str:
    """
    Create a standard header for scrape outputs.
    """
    ts = datetime.utcnow().isoformat()
    return f"# {source} scrape\n- url: {url}\n- retrieved_utc: {ts}\n\n"


__all__ = [
    "ensure_project",
    "resolve_output_path",
    "render_header",
]
