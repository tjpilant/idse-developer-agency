from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.intent import intent_agent
from SessionManager import SessionManager


class GenerateIntentTool(BaseTool):
    """Generate or update intent.md using provided text or initialize a template."""

    intent_text: str | None = Field(
        default=None,
        description="Optional intent content to write. If omitted, preserves existing intent or initializes a template.",
    )
    project: str = Field(
        default="default",
        description="Project name for session-scoped paths.",
    )
    output_path: str = Field(
        default="intents/projects/<project>/sessions/<active>/intent.md",
        description="Path where intent.md should be written (session-scoped).",
    )

    def run(self) -> str:
        # Switch active session project if needed
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        output_resolved = SessionManager.build_path("intents", "intent.md")
        return intent_agent.run(intent_text=self.intent_text, output_path=str(output_resolved))
