from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.implementation import implementation_agent


class ImplementSystemTool(BaseTool):
    """Scaffold implementation artifacts based on tasks."""

    tasks_path: str = Field(
        default="tasks/current/tasks.md",
        description="Path to tasks.md.",
    )
    output_path: str = Field(
        default="implementation/current/README.md",
        description="Path where implementation scaffold should be written.",
    )

    def run(self) -> str:
        return implementation_agent.run(
            tasks_path=self.tasks_path,
            output_path=self.output_path,
        )
