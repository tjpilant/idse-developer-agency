from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.feedback import feedback_agent
from SessionManager import SessionManager


class FeedbackAuditTool(BaseTool):
    """Record feedback and map to upstream artifacts for iteration."""

    feedback_text: str = Field(
        default="No external feedback provided.",
        description="Feedback notes to record.",
    )
    output_path: str = Field(
        default="projects/<project>/sessions/<active>/feedback/feedback.md",
        description="Path where feedback.md should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        output_resolved = SessionManager.build_path("feedback", "feedback.md")
        return feedback_agent.run(
            feedback_text=self.feedback_text,
            output_path=str(output_resolved),
        )
