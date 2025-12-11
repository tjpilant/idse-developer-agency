from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.context import context_agent


class DeriveContextTool(BaseTool):
    """Generate or scaffold context.md based on provided text or existing intent."""

    context_text: str | None = Field(
        default=None,
        description="Optional context content to write. If omitted, scaffolds a context shell referencing intent.",
    )
    intent_path: str = Field(
        default="intents/current/intent.md",
        description="Path to the current intent.md.",
    )
    output_path: str = Field(
        default="contexts/current/context.md",
        description="Path where context.md should be written.",
    )

    def run(self) -> str:
        return context_agent.run(
            context_text=self.context_text,
            intent_path=self.intent_path,
            output_path=self.output_path,
        )
