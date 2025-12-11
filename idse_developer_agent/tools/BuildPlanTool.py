from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.plan import plan_agent


class BuildPlanTool(BaseTool):
    """Generate plan.md and test-plan.md from the specification."""

    spec_path: str = Field(
        default="specs/current/spec.md",
        description="Path to spec.md.",
    )
    plan_path: str = Field(
        default="plans/current/plan.md",
        description="Path where plan.md should be written.",
    )
    test_plan_path: str = Field(
        default="plans/current/test-plan.md",
        description="Path where test-plan.md should be written.",
    )

    def run(self) -> str:
        return plan_agent.run(
            spec_path=self.spec_path,
            plan_path=self.plan_path,
            test_plan_path=self.test_plan_path,
        )
