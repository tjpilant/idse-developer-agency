from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.intent import intent_agent


class GenerateIntentTool(BaseTool):
    """Generate or update intent.md using provided text or initialize a template."""

    intent_text: str | None = Field(
        default=None,
        description="Optional intent content to write. If omitted, preserves existing intent or initializes a template.",
    )
    output_path: str = Field(
        default="intents/current/intent.md",
        description="Path where intent.md should be written.",
    )

    def run(self) -> str:
        return intent_agent.run(intent_text=self.intent_text, output_path=self.output_path)
