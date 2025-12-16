from pathlib import Path

IMPL_TEMPLATE = Path("docs/kb/templates/plan-template.md")  # reuse plan template structure as a scaffold


def run(tasks_path: str = "tasks/current/tasks.md", output_path: str = "implementation/current/README.md") -> str:
    """
    Scaffold implementation artifacts based on tasks, mirroring plan structure.
    """
    tasks = Path(tasks_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    tasks_text = tasks.read_text(encoding="utf-8").strip() if tasks.exists() else "(tasks missing)"

    if IMPL_TEMPLATE.exists():
        plan_lines = IMPL_TEMPLATE.read_text(encoding="utf-8").strip().splitlines()
        if plan_lines and plan_lines[0].lstrip().startswith("#"):
            plan_lines = plan_lines[1:]
        impl_doc = [
            "# Implementation Scaffold",
            "",
            f"Source tasks: {tasks_path}",
            "",
            *plan_lines,
            "",
            "## Tasks Reference",
            tasks_text,
        ]
    else:
        impl_doc = [
            "# Implementation Scaffold",
            "",
            f"Source tasks: {tasks_path}",
            "",
            "## Notes",
            "- [REQUIRES INPUT] Add code/test scaffolding per tasks.",
            "- [REQUIRES INPUT] Link to relevant modules and validation scripts.",
            "",
            "## Architecture Summary",
            "- [REQUIRES INPUT] overview",
            "",
            "## Components",
            "| Component | Responsibility | Interfaces / Dependencies |",
            "| --- | --- | --- |",
            "| [REQUIRES INPUT] | [REQUIRES INPUT] | [REQUIRES INPUT] |",
            "",
            "## Data Model",
            "- [REQUIRES INPUT] entities/relationships",
            "",
            "## API Contracts",
            "- [REQUIRES INPUT] endpoints/contracts/security",
            "",
            "## Test Strategy",
            "- [REQUIRES INPUT] unit/contract/integration/e2e/perf/security",
            "",
            "## Phases",
            "- [REQUIRES INPUT] Phase 0/1/2/3",
            "",
            "## Tasks Reference",
            tasks_text,
        ]

    target.write_text("\n".join(impl_doc).rstrip() + "\n", encoding="utf-8")
    return f"✅ Implementation scaffold written to {target}"
