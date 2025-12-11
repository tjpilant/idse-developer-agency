from pathlib import Path
from typing import Optional


def run(intent_text: Optional[str] = None, output_path: str = "intents/current/intent.md") -> str:
    """
    Generate or update intent.md with provided text.

    Args:
        intent_text: Optional intent content. If not provided, preserves existing content if present.
        output_path: Destination path for intent.md.
    """
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    if intent_text:
        target.write_text(intent_text.strip() + "\n", encoding="utf-8")
        return f"✅ intent.md written to {target}"

    if target.exists():
        return f"ℹ️ intent.md already exists at {target}; no changes made"

    # Initialize with a minimal template if nothing provided
    template = "# Intent\n\n(Provide project intent here.)\n"
    target.write_text(template, encoding="utf-8")
    return f"✅ intent.md initialized at {target}"
