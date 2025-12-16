from pathlib import Path

PLAN_TEMPLATE = Path("docs/kb/templates/plan-template.md")
TEST_TEMPLATE = Path("docs/kb/templates/test-plan-template.md")


def run(
    spec_path: str = "specs/current/spec.md",
    plan_path: str = "plans/current/plan.md",
    test_plan_path: str = "plans/current/test-plan.md",
) -> str:
    """
    Build plan.md and test-plan.md from the specification using KB templates.
    """
    spec = Path(spec_path)
    plan_target = Path(plan_path)
    test_target = Path(test_plan_path)
    plan_target.parent.mkdir(parents=True, exist_ok=True)

    spec_text = spec.read_text(encoding="utf-8").strip() if spec.exists() else "(spec missing)"

    # Plan
    if PLAN_TEMPLATE.exists():
        plan_lines = PLAN_TEMPLATE.read_text(encoding="utf-8").strip().splitlines()
        if plan_lines and plan_lines[0].lstrip().startswith("#"):
            plan_lines = plan_lines[1:]
        plan_doc = [
            "# Implementation Plan",
            "",
            f"Source spec: {spec_path}",
            "",
            *plan_lines,
        ]
    else:
        plan_doc = [
            "# Implementation Plan",
            "",
            f"Source spec: {spec_path}",
            "",
            "## 1. Architecture Summary",
            "- [REQUIRES INPUT] overview",
            "",
            "## 2. Components",
            "| Component | Responsibility | Interfaces / Dependencies |",
            "| --- | --- | --- |",
            "| [REQUIRES INPUT] | [REQUIRES INPUT] | [REQUIRES INPUT] |",
            "",
            "## 3. Data Model",
            "- [REQUIRES INPUT] entities/relationships",
            "",
            "## 4. API Contracts",
            "- [REQUIRES INPUT] endpoints/contracts/security",
            "",
            "## 5. Test Strategy",
            "- [REQUIRES INPUT] unit/contract/integration/e2e/perf/security",
            "",
            "## 6. Phases",
            "- [REQUIRES INPUT] Phase 0/1/2/3",
        ]

    # Test Plan
    if TEST_TEMPLATE.exists():
        test_lines = TEST_TEMPLATE.read_text(encoding="utf-8").strip().splitlines()
        if test_lines and test_lines[0].lstrip().startswith("#"):
            test_lines = test_lines[1:]
        test_doc = [
            "# Test Plan",
            "",
            f"Source spec: {spec_path}",
            "",
            *test_lines,
        ]
    else:
        test_doc = [
            "# Test Plan",
            "",
            f"Source spec: {spec_path}",
            "",
            "## Objectives",
            "- [REQUIRES INPUT] goals and scope",
            "",
            "## Test Types and Approach",
            "- [REQUIRES INPUT] unit/contract/integration/e2e/perf/security",
            "",
            "## Test Environment",
            "- [REQUIRES INPUT] environment versions/services",
            "",
            "## Test Data",
            "- [REQUIRES INPUT] fixtures and payloads",
            "",
            "## Success Criteria",
            "- [REQUIRES INPUT] measurable targets",
            "",
            "## Reporting",
            "- [REQUIRES INPUT] reporting/triage",
        ]

    plan_target.write_text("\n".join(plan_doc).rstrip() + "\n", encoding="utf-8")
    test_target.write_text("\n".join(test_doc).rstrip() + "\n", encoding="utf-8")

    return f"✅ plan.md and test-plan.md generated at {plan_target.parent}"
