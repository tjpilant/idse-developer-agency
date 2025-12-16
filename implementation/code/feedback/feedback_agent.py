from pathlib import Path
from datetime import datetime, timezone

FEEDBACK_TEMPLATE = Path("docs/kb/templates/feedback-template.md")


def run(feedback_text: str = "No external feedback provided.", output_path: str = "feedback/current/feedback.md") -> str:
    """
    Record feedback and link to upstream artifacts for iteration.
    """
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    stamped = datetime.now(timezone.utc).isoformat()

    if FEEDBACK_TEMPLATE.exists():
        lines = FEEDBACK_TEMPLATE.read_text(encoding="utf-8").strip().splitlines()
        if lines and lines[0].lstrip().startswith("#"):
            lines = lines[1:]
        doc = [
            "# Feedback",
            "",
            f"Timestamp: {stamped}",
            "",
            "## Notes",
            feedback_text,
            "",
            *lines,
        ]
    else:
        doc = [
            "# Feedback",
            "",
            f"Timestamp: {stamped}",
            "",
            "## Notes",
            feedback_text,
            "",
            "## Next Steps",
            "- [REQUIRES INPUT] Map feedback to intent/context/spec updates.",
            "- [REQUIRES INPUT] Re-run validation scripts as needed.",
            "- [REQUIRES INPUT] Update tests/plans accordingly.",
        ]

    target.write_text("\n".join(doc).rstrip() + "\n", encoding="utf-8")
    return f"✅ Feedback captured at {target}"
