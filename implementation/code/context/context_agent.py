from pathlib import Path
from typing import Optional

TEMPLATE_PATH = Path("docs/kb/templates/context-template.md")


def run(
    context_text: Optional[str] = None,
    intent_path: str = "intents/current/intent.md",
    output_path: str = "contexts/current/context.md",
) -> str:
    """
    Derive or record context based on the provided text or existing intent.

    Args:
        context_text: Optional context content. If not provided, scaffolds a context shell using the KB template.
        intent_path: Path to the current intent.md.
        output_path: Destination path for context.md.
    """
    intent_file = Path(intent_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    intent_summary = "(intent not found)"
    if intent_file.exists():
        intent_summary = (
            intent_file.read_text(encoding="utf-8").strip().splitlines()[0]
            if intent_file.stat().st_size
            else "(intent empty)"
        )

    if context_text:
        target.write_text(context_text.strip() + "\n", encoding="utf-8")
        return f"✅ context.md written to {target}"

    # Load the canonical template, or fall back to the prior minimal scaffold.
    if TEMPLATE_PATH.exists():
        template_text = TEMPLATE_PATH.read_text(encoding="utf-8").strip()
        # Drop a leading "# Context" heading if present to avoid duplicate headings.
        lines = template_text.splitlines()
        if lines and lines[0].lstrip().startswith("#"):
            lines = lines[1:]
        scaffold = [
            "# Context",
            "",
            f"Intent reference: {intent_path} -> {intent_summary}",
            "",
            *lines,
        ]
    else:
        scaffold = [
            "# Context",
            "",
            f"Intent reference: {intent_path} -> {intent_summary}",
            "",
            "## Environment",
            "- [REQUIRES INPUT] capture environment details here",
            "",
            "## Stack",
            "- [REQUIRES INPUT] languages/frameworks/infra",
            "",
            "## Constraints",
            "- [REQUIRES INPUT] list constraints and assumptions",
            "",
            "## Dependencies",
            "- [REQUIRES INPUT] list required systems/APIs",
            "",
            "## Risks & Unknowns",
            "- [REQUIRES INPUT] capture risks and unknowns",
        ]

    target.write_text("\n".join(scaffold).rstrip() + "\n", encoding="utf-8")
    return f"✅ context.md scaffolded at {target}"
