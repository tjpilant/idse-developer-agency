from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.feedback import feedback_agent


class FeedbackAuditTool(BaseTool):
    """Record feedback and map to upstream artifacts for iteration."""

    feedback_text: str = Field(
        default="No external feedback provided.",
        description="Feedback notes to record.",
    )
    output_path: str = Field(
        default="feedback/current/feedback.md",
        description="Path where feedback.md should be written.",
    )

    def run(self) -> str:
        return feedback_agent.run(
            feedback_text=self.feedback_text,
            output_path=self.output_path,
        )
