from pathlib import Path


def run(spec_path: str = "specs/current/spec.md", plan_path: str = "plans/current/plan.md", test_plan_path: str = "plans/current/test-plan.md") -> str:
    """
    Build plan.md and test-plan.md from the specification.
    """
    spec = Path(spec_path)
    plan_target = Path(plan_path)
    test_target = Path(test_plan_path)
    plan_target.parent.mkdir(parents=True, exist_ok=True)

    spec_text = spec.read_text(encoding="utf-8").strip() if spec.exists() else "(spec missing)"

    plan_doc = [
        "# Plan",
        "",
        "## Scope",
        "- Summarize scope derived from spec.",
        "",
        "## Milestones",
        "- Milestone 1: ...",
        "- Milestone 2: ...",
        "",
        "## Workstreams",
        "- Workstream A: ...",
        "- Workstream B: ...",
        "",
        "## Source Spec",
        spec_text,
    ]

    test_doc = [
        "# Test Plan",
        "",
        "## Objectives",
        "- Validate functional and non-functional requirements.",
        "",
        "## Test Cases",
        "- TC1: ...",
        "- TC2: ...",
        "",
        "## Acceptance Criteria",
        "- Criteria 1: ...",
        "- Criteria 2: ...",
    ]

    plan_target.write_text("\n".join(plan_doc) + "\n", encoding="utf-8")
    test_target.write_text("\n".join(test_doc) + "\n", encoding="utf-8")

    return f"✅ plan.md and test-plan.md generated at {plan_target.parent}"
