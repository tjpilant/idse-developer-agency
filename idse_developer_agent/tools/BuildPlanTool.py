from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.plan import plan_agent
from SessionManager import SessionManager


class BuildPlanTool(BaseTool):
    """Generate plan.md and test-plan.md from the specification."""

    spec_path: str = Field(
        default="projects/<project>/sessions/<active>/specs/spec.md",
        description="Path to spec.md (project/session scoped).",
    )
    plan_path: str = Field(
        default="projects/<project>/sessions/<active>/plans/plan.md",
        description="Path where plan.md should be written (project/session scoped).",
    )
    test_plan_path: str = Field(
        default="projects/<project>/sessions/<active>/plans/test-plan.md",
        description="Path where test-plan.md should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)
        spec_resolved = SessionManager.build_path("specs", "spec.md")
        plan_resolved = SessionManager.build_path("plans", "plan.md")
        test_resolved = SessionManager.build_path("plans", "test-plan.md")
        return plan_agent.run(
            spec_path=str(spec_resolved),
            plan_path=str(plan_resolved),
            test_plan_path=str(test_resolved),
        )
