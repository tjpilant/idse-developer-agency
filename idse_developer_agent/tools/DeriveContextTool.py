from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.context import context_agent
from SessionManager import SessionManager


class DeriveContextTool(BaseTool):
    """Generate or scaffold context.md based on provided text or existing intent."""

    context_text: str | None = Field(
        default=None,
        description="Optional context content to write. If omitted, scaffolds a context shell referencing intent.",
    )
    intent_path: str = Field(
        default="projects/<project>/sessions/<active>/intents/intent.md",
        description="Path to the current intent.md (project/session scoped).",
    )
    output_path: str = Field(
        default="projects/<project>/sessions/<active>/contexts/context.md",
        description="Path where context.md should be written (project/session scoped).",
    )

    def run(self) -> str:
        intent_resolved = (
            SessionManager.build_path("intents", "intent.md") if "<active>" in self.intent_path else self.intent_path
        )
        output_resolved = (
            SessionManager.build_path("contexts", "context.md") if "<active>" in self.output_path else self.output_path
        )
        return context_agent.run(
            context_text=self.context_text,
            intent_path=str(intent_resolved),
            output_path=str(output_resolved),
        )
