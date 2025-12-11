from pathlib import Path


def run(plan_path: str = "plans/current/plan.md", output_path: str = "tasks/current/tasks.md") -> str:
    """
    Generate an atomic task list based on the plan.
    """
    plan = Path(plan_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    plan_text = plan.read_text(encoding="utf-8").strip() if plan.exists() else "(plan missing)"

    tasks_doc = [
        "# Tasks",
        "",
        "## Task List",
        "1. Review plan and spec alignment.",
        "2. Implement planned workstreams incrementally.",
        "3. Validate outputs against acceptance criteria.",
        "",
        "## Source Plan",
        plan_text,
    ]

    target.write_text("\n".join(tasks_doc) + "\n", encoding="utf-8")
    return f"✅ tasks.md generated at {target}"
