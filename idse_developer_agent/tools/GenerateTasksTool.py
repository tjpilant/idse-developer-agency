from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.task import task_agent


class GenerateTasksTool(BaseTool):
    """Generate an atomic task list from plan.md."""

    plan_path: str = Field(
        default="plans/current/plan.md",
        description="Path to plan.md.",
    )
    output_path: str = Field(
        default="tasks/current/tasks.md",
        description="Path where tasks.md should be written.",
    )

    def run(self) -> str:
        return task_agent.run(plan_path=self.plan_path, output_path=self.output_path)
