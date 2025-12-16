from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.spec import spec_agent
from SessionManager import SessionManager


class CreateSpecTool(BaseTool):
    """Generate spec.md from intent and context."""

    intent_path: str = Field(
        default="intents/projects/<project>/sessions/<active>/intent.md",
        description="Path to intent.md (project/session scoped).",
    )
    context_path: str = Field(
        default="contexts/projects/<project>/sessions/<active>/context.md",
        description="Path to context.md (project/session scoped).",
    )
    output_path: str = Field(
        default="specs/projects/<project>/sessions/<active>/spec.md",
        description="Path where spec.md should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        intent_resolved = SessionManager.build_path("intents", "intent.md")
        context_resolved = SessionManager.build_path("contexts", "context.md")
        output_resolved = SessionManager.build_path("specs", "spec.md")
        return spec_agent.run(
            intent_path=str(intent_resolved),
            context_path=str(context_resolved),
            output_path=str(output_resolved),
        )
