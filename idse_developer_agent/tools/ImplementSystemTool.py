from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.implementation import implementation_agent
from SessionManager import SessionManager


class ImplementSystemTool(BaseTool):
    """Scaffold implementation artifacts based on tasks."""

    tasks_path: str = Field(
        default="projects/<project>/sessions/<active>/tasks/tasks.md",
        description="Path to tasks.md (project/session scoped).",
    )
    output_path: str = Field(
        default="projects/<project>/sessions/<active>/implementation/README.md",
        description="Path where implementation scaffold should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        tasks_resolved = SessionManager.build_path("tasks", "tasks.md")
        output_resolved = SessionManager.build_path("implementation", "README.md")
        return implementation_agent.run(
            tasks_path=str(tasks_resolved),
            output_path=str(output_resolved),
        )
