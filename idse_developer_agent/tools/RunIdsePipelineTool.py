from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.intent import intent_agent
from implementation.code.context import context_agent
from implementation.code.spec import spec_agent
from implementation.code.plan import plan_agent
from implementation.code.task import task_agent
from implementation.code.implementation import implementation_agent
from implementation.code.feedback import feedback_agent


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

    # Paths for artifacts (override if needed)
    intent_path: str = Field(default="intents/current/intent.md", description="intent.md path")
    context_path: str = Field(default="contexts/current/context.md", description="context.md path")
    spec_path: str = Field(default="specs/current/spec.md", description="spec.md path")
    plan_path: str = Field(default="plans/current/plan.md", description="plan.md path")
    test_plan_path: str = Field(default="plans/current/test-plan.md", description="test-plan.md path")
    tasks_path: str = Field(default="tasks/current/tasks.md", description="tasks.md path")
    impl_path: str = Field(default="implementation/current/README.md", description="implementation scaffold path")
    feedback_path: str = Field(default="feedback/current/feedback.md", description="feedback.md path")
    force_overwrite: bool = Field(
        default=False,
        description="If True, overwrite existing artifacts; otherwise, preserve and skip when present.",
    )

    def run(self) -> str:
        steps = []

        steps.append(intent_agent.run(intent_text=self.intent_text, output_path=self.intent_path))

        def maybe(step_fn, label):
            from pathlib import Path

            target_path = Path(label)
            if target_path.exists() and not self.force_overwrite:
                return f"⚠️ Skipped (exists): {target_path}"
            return step_fn()

        steps.append(
            maybe(
                lambda: context_agent.run(context_text=None, intent_path=self.intent_path, output_path=self.context_path),
                self.context_path,
            )
        )
        steps.append(
            maybe(
                lambda: spec_agent.run(intent_path=self.intent_path, context_path=self.context_path, output_path=self.spec_path),
                self.spec_path,
            )
        )
        steps.append(
            maybe(
                lambda: plan_agent.run(spec_path=self.spec_path, plan_path=self.plan_path, test_plan_path=self.test_plan_path),
                self.plan_path,
            )
        )
        steps.append(
            maybe(
                lambda: task_agent.run(plan_path=self.plan_path, output_path=self.tasks_path),
                self.tasks_path,
            )
        )
        steps.append(
            maybe(
                lambda: implementation_agent.run(tasks_path=self.tasks_path, output_path=self.impl_path),
                self.impl_path,
            )
        )
        steps.append(
            maybe(
                lambda: feedback_agent.run(feedback_text=self.feedback_text, output_path=self.feedback_path),
                self.feedback_path,
            )
        )

        return " | ".join(steps)
