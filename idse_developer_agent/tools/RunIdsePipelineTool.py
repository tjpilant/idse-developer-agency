from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.intent import intent_agent
from implementation.code.context import context_agent
from implementation.code.spec import spec_agent
from implementation.code.plan import plan_agent
from implementation.code.task import task_agent
from implementation.code.implementation import implementation_agent
from implementation.code.feedback import feedback_agent
from SessionManager import SessionManager


class RunIdsePipelineTool(BaseTool):
    """Execute the IDSE pipeline tools in order: Intent → Context → Spec → Plan → Tasks → Implementation → Feedback."""

    intent_text: str | None = Field(
        default=None,
        description="Optional intent content; if omitted, uses existing intent or template.",
    )
    feedback_text: str = Field(
        default="No external feedback provided.",
        description="Feedback notes to record at the end of the run.",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")
    confirm: bool = Field(
        default=False,
        description="Set True to allow the full pipeline to run. Default False prevents accidental autopilot.",
    )

    def run(self) -> str:
        if not self.confirm:
            raise RuntimeError(
                "RunIdsePipelineTool requires confirm=True to execute. "
                "Use individual stage tools for step-by-step control."
            )
        # Switch/resume project session
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)

        paths = {
            "intent": SessionManager.build_path("intents", "intent.md"),
            "context": SessionManager.build_path("contexts", "context.md"),
            "spec": SessionManager.build_path("specs", "spec.md"),
            "plan": SessionManager.build_path("plans", "plan.md"),
            "test_plan": SessionManager.build_path("plans", "test-plan.md"),
            "tasks": SessionManager.build_path("tasks", "tasks.md"),
            "impl": SessionManager.build_path("implementation", "README.md"),
            "feedback": SessionManager.build_path("feedback", "feedback.md"),
        }

        steps = []
        steps.append(intent_agent.run(intent_text=self.intent_text, output_path=str(paths["intent"])))
        steps.append(
            context_agent.run(
                context_text=None,
                intent_path=str(paths["intent"]),
                output_path=str(paths["context"]),
            )
        )
        steps.append(
            spec_agent.run(
                intent_path=str(paths["intent"]),
                context_path=str(paths["context"]),
                output_path=str(paths["spec"]),
            )
        )
        steps.append(
            plan_agent.run(
                spec_path=str(paths["spec"]),
                plan_path=str(paths["plan"]),
                test_plan_path=str(paths["test_plan"]),
            )
        )
        steps.append(
            task_agent.run(
                plan_path=str(paths["plan"]),
                output_path=str(paths["tasks"]),
            )
        )
        steps.append(
            implementation_agent.run(
                tasks_path=str(paths["tasks"]),
                output_path=str(paths["impl"]),
            )
        )
        steps.append(
            feedback_agent.run(
                feedback_text=self.feedback_text,
                output_path=str(paths["feedback"]),
            )
        )

        return " | ".join(steps)
