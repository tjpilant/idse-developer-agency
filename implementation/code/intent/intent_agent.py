from pathlib import Path
from typing import Optional

TEMPLATE_PATH = Path("docs/kb/templates/intent-template.md")


def run(intent_text: Optional[str] = None, output_path: str = "intents/current/intent.md") -> str:
    """
    Generate or update intent.md with provided text.

    Args:
        intent_text: Optional intent content. If not provided, uses the KB template.
        output_path: Destination path for intent.md.
    """
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    if intent_text:
        target.write_text(intent_text.strip() + "\n", encoding="utf-8")
        return f"✅ intent.md written to {target}"

    # If intent already exists, keep it
    if target.exists():
        return f"ℹ️ intent.md already exists at {target}; no changes made"

    # Initialize from template if present, else fallback
    if TEMPLATE_PATH.exists():
        template_text = TEMPLATE_PATH.read_text(encoding="utf-8").strip()
        target.write_text(template_text + "\n", encoding="utf-8")
    else:
        template = [
            "# Intent",
            "",
            "## Goal",
            "- [REQUIRES INPUT] goal",
            "",
            "## Problem / Opportunity",
            "- [REQUIRES INPUT] problem/opportunity",
            "",
            "## Stakeholders / Users",
            "- [REQUIRES INPUT] primary users and goals",
            "",
            "## Success Criteria (measurable)",
            "- [REQUIRES INPUT] Baseline → Target",
            "",
            "## Constraints / Assumptions / Risks",
            "- Business/Compliance: [REQUIRES INPUT]",
            "- Technical: [REQUIRES INPUT]",
            "- Known risks: [REQUIRES INPUT]",
            "",
            "## Scope",
            "- In scope: [REQUIRES INPUT]",
            "- Out of scope / non-goals: [REQUIRES INPUT]",
            "- Dependencies: [REQUIRES INPUT]",
            "",
            "## Time / Priority",
            "- Deadline or target release: [REQUIRES INPUT]",
            "- Criticality / priority: [REQUIRES INPUT]",
        ]
        target.write_text("\n".join(template) + "\n", encoding="utf-8")

    return f"✅ intent.md initialized at {target}"
