from pathlib import Path

TEMPLATE_PATH = Path("docs/kb/templates/tasks-template.md")


def run(plan_path: str = "plans/current/plan.md", output_path: str = "tasks/current/tasks.md") -> str:
    """
    Generate an atomic task list based on the plan using the KB template.
    """
    plan = Path(plan_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    plan_text = plan.read_text(encoding="utf-8").strip() if plan.exists() else "(plan missing)"

    if TEMPLATE_PATH.exists():
        template = TEMPLATE_PATH.read_text(encoding="utf-8").strip().splitlines()
        # Drop leading "# Tasks" to avoid duplicate header
        if template and template[0].lstrip().startswith("#"):
            template = template[1:]
        tasks_doc = [
            "# Tasks",
            "",
            f"Source plan: {plan_path}",
            "",
            *template,
            "",
            "## Plan Reference",
            plan_text,
        ]
    else:
        tasks_doc = [
            "# Tasks",
            "",
            "## Instructions",
            "- Derive tasks directly from the implementation plan and contracts.",
            "- For each task, note owner, dependencies, and acceptance/validation notes.",
            "- Keep tasks independent and testable; mark parallelizable tasks with [P].",
            "",
            "## Phase 0 – Foundations",
            "- [ ] Task 0.1 – [REQUIRES INPUT]",
            "- [ ] Task 0.2 – [REQUIRES INPUT]",
            "",
            "## Phase 1 – Core Behavior",
            "- [ ] Task 1.1 – [REQUIRES INPUT]",
            "- [ ] Task 1.2 – [REQUIRES INPUT]",
            "",
            "## Phase 2 – NFRs / Hardening",
            "- [ ] Task 2.1 – [REQUIRES INPUT]",
            "- [ ] Task 2.2 – [REQUIRES INPUT]",
            "",
            "## Plan Reference",
            plan_text,
        ]

    target.write_text("\n".join(tasks_doc).rstrip() + "\n", encoding="utf-8")
    return f"✅ tasks.md generated at {target}"
