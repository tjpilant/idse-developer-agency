from pathlib import Path
from typing import Optional


def run(context_text: Optional[str] = None, intent_path: str = "intents/current/intent.md", output_path: str = "contexts/current/context.md") -> str:
    """
    Derive or record context based on the provided text or existing intent.

    Args:
        context_text: Optional context content. If not provided, scaffolds a context shell referencing intent.
        intent_path: Path to the current intent.md.
        output_path: Destination path for context.md.
    """
    intent_file = Path(intent_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    intent_summary = "(intent not found)"
    if intent_file.exists():
        intent_summary = intent_file.read_text(encoding="utf-8").strip().splitlines()[0] if intent_file.stat().st_size else "(intent empty)"

    if context_text:
        target.write_text(context_text.strip() + "\n", encoding="utf-8")
        return f"✅ context.md written to {target}"

    scaffold = [
        "# Context",
        "",
        f"Intent reference: {intent_path} -> {intent_summary}",
        "",
        "## Environment",
        "- (capture environment details here)",
        "",
        "## Constraints",
        "- (list constraints and assumptions)",
        "",
        "## Dependencies",
        "- (list required systems/APIs)",
    ]
    target.write_text("\n".join(scaffold) + "\n", encoding="utf-8")
    return f"✅ context.md scaffolded at {target}"
