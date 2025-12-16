from pathlib import Path

TEMPLATE_PATH = Path("docs/kb/templates/spec-template.md")


def run(
    intent_path: str = "intents/current/intent.md",
    context_path: str = "contexts/current/context.md",
    output_path: str = "specs/current/spec.md",
) -> str:
    """
    Generate spec.md from intent and context using the KB template.
    """
    intent = Path(intent_path)
    context = Path(context_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    intent_text = intent.read_text(encoding="utf-8").strip() if intent.exists() else "(intent missing)"
    context_text = context.read_text(encoding="utf-8").strip() if context.exists() else "(context missing)"

    if TEMPLATE_PATH.exists():
        template = TEMPLATE_PATH.read_text(encoding="utf-8").strip()
        # Drop leading "# Specification" if present to avoid duplicate header
        lines = template.splitlines()
        if lines and lines[0].lstrip().startswith("#"):
            lines = lines[1:]
        spec_doc = [
            "# Specification",
            "",
            f"Intent source: {intent_path}",
            f"Context source: {context_path}",
            "",
            "## Intent",
            intent_text,
            "",
            "## Context",
            context_text,
            "",
            *lines,
        ]
    else:
        spec_doc = [
            "# Specification",
            "",
            f"Intent source: {intent_path}",
            f"Context source: {context_path}",
            "",
            "## Overview",
            "- [REQUIRES INPUT] summary and link back to intent/context",
            "",
            "## User Stories",
            "- [REQUIRES INPUT] As a ..., I want ..., so that ...",
            "",
            "## Functional Requirements",
            "- [REQUIRES INPUT] FR-1 ...",
            "- [REQUIRES INPUT] FR-2 ...",
            "",
            "## Non-Functional Requirements",
            "- [REQUIRES INPUT] performance, scale, security, reliability targets",
            "",
            "## Acceptance Criteria",
            "- [REQUIRES INPUT] AC-1 ...",
            "- [REQUIRES INPUT] AC-2 ...",
            "",
            "## Assumptions / Constraints / Dependencies",
            "- Assumptions: [REQUIRES INPUT]",
            "- Constraints: [REQUIRES INPUT]",
            "- Dependencies: [REQUIRES INPUT]",
            "",
            "## Open Questions",
            "- [REQUIRES INPUT] ...",
        ]

    target.write_text("\n".join(spec_doc).rstrip() + "\n", encoding="utf-8")
    return f"✅ spec.md generated at {target}"
