from pathlib import Path


def run(intent_path: str = "intents/current/intent.md", context_path: str = "contexts/current/context.md", output_path: str = "specs/current/spec.md") -> str:
    """
    Generate a basic spec.md from intent and context.
    """
    intent = Path(intent_path)
    context = Path(context_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    intent_text = intent.read_text(encoding="utf-8").strip() if intent.exists() else "(intent missing)"
    context_text = context.read_text(encoding="utf-8").strip() if context.exists() else "(context missing)"

    spec_sections = [
        "# Specification",
        "",
        "## Intent",
        intent_text,
        "",
        "## Context",
        context_text,
        "",
        "## Requirements",
        "- Define functional requirements here.",
        "- Define non-functional requirements here.",
        "",
        "## Success Criteria",
        "- Define measurable success criteria here.",
    ]

    target.write_text("\n".join(spec_sections) + "\n", encoding="utf-8")
    return f"✅ spec.md generated at {target}"
