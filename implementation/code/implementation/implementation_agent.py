from pathlib import Path


def run(tasks_path: str = "tasks/current/tasks.md", output_path: str = "implementation/current/README.md") -> str:
    """
    Scaffold implementation artifacts based on tasks.
    """
    tasks = Path(tasks_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    tasks_text = tasks.read_text(encoding="utf-8").strip() if tasks.exists() else "(tasks missing)"

    impl_doc = [
        "# Implementation Scaffold",
        "",
        "## Tasks Reference",
        tasks_text,
        "",
        "## Notes",
        "- Add code/test scaffolding per tasks.",
        "- Link to relevant modules and validation scripts.",
    ]

    target.write_text("\n".join(impl_doc) + "\n", encoding="utf-8")
    return f"✅ Implementation scaffold written to {target}"
