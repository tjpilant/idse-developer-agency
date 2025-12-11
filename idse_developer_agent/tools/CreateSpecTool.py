from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.spec import spec_agent


class CreateSpecTool(BaseTool):
    """Generate spec.md from intent and context."""

    intent_path: str = Field(
        default="intents/current/intent.md",
        description="Path to intent.md.",
    )
    context_path: str = Field(
        default="contexts/current/context.md",
        description="Path to context.md.",
    )
    output_path: str = Field(
        default="specs/current/spec.md",
        description="Path where spec.md should be written.",
    )

    def run(self) -> str:
        return spec_agent.run(
            intent_path=self.intent_path,
            context_path=self.context_path,
            output_path=self.output_path,
        )
