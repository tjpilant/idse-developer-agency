from __future__ import annotations

import os
from pathlib import Path

from agency_swarm.tools import BaseTool
from pydantic import Field

from SessionManager import SessionManager
from idse_developer_agent.tools.scraper_suite.scraper_dispatcher_tool import ScraperDispatcherTool


class GenerateContextTool(BaseTool):
    """
    Use ScraperDispatcherTool to gather context from a URL or local path and persist to session-scoped context.md.
    """

    name: str = "GenerateContextTool"
    source: str = Field(
        default="",
        description="URL (website or GitHub repo) or local folder/file path to gather context from.",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")
    output_path: str = Field(
        default="projects/<project>/sessions/<active>/contexts/context.md",
        description="Path where context.md should be written (session-scoped).",
    )

    def run(self) -> str:
        # Ensure active session aligns with project
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)

        dispatcher = ScraperDispatcherTool(url=self.source)
        result = dispatcher.run()

        # Resolve output path
        if "<active>" in self.output_path or "<project>" in self.output_path:
            output_resolved = SessionManager.build_path("contexts", "context.md")
        else:
            output_resolved = Path(self.output_path)
            output_resolved.parent.mkdir(parents=True, exist_ok=True)

        try:
            output_resolved.write_text(str(result), encoding="utf-8")
            return f"✅ Context gathered from `{self.source}` and saved to `{output_resolved}`."
        except Exception as exc:
            return f"❌ Failed to write context to `{output_resolved}`: {exc}"
