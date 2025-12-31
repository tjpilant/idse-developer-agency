from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.task import task_agent
from SessionManager import SessionManager


class GenerateTasksTool(BaseTool):
    """Generate an atomic task list from plan.md."""

    plan_path: str = Field(
        default="projects/<project>/sessions/<active>/plans/plan.md",
        description="Path to plan.md (project/session scoped).",
    )
    output_path: str = Field(
        default="projects/<project>/sessions/<active>/tasks/tasks.md",
        description="Path where tasks.md should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        plan_resolved = SessionManager.build_path("plans", "plan.md")
        output_resolved = SessionManager.build_path("tasks", "tasks.md")
        return task_agent.run(plan_path=str(plan_resolved), output_path=str(output_resolved))
