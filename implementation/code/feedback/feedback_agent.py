from pathlib import Path
from datetime import datetime, timezone


def run(feedback_text: str = "No external feedback provided.", output_path: str = "feedback/current/feedback.md") -> str:
    """
    Record feedback and link to upstream artifacts for iteration.
    """
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    stamped = datetime.now(timezone.utc).isoformat()

    doc = [
        "# Feedback",
        "",
        f"Timestamp: {stamped}",
        "",
        "## Notes",
        feedback_text,
        "",
        "## Next Steps",
        "- Map feedback to intent/context/spec updates.",
        "- Re-run validation scripts as needed.",
    ]

    target.write_text("\n".join(doc) + "\n", encoding="utf-8")
    return f"✅ Feedback captured at {target}"
