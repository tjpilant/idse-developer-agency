"""
Lightweight validation for IDSE artifacts to ensure required sections exist.
Checks intent.md and context.md for canonical sections and markers.
"""

from pathlib import Path
import sys


def check_intent(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"intent file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "## Goal",
        "## Problem / Opportunity",
        "## Stakeholders / Users",
        "## Success Criteria",
        "## Constraints / Assumptions / Risks",
        "## Scope",
        "## Time / Priority",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in intent: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Intent still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_context(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"context file missing: {path}"]

    text = path.read_text(encoding="utf-8")
    required_tokens = ["Environment", "Stack", "Constraints", "Risks & Unknowns"]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in context: {token}")

    if "[REQUIRES INPUT]" in text:
        errors.append("Context still contains [REQUIRES INPUT]; fill before publish.")

    return errors


def check_tasks(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"tasks file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = ["Phase 0", "Phase 1", "Phase 2"]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in tasks: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Tasks still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_spec(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"spec file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "## Overview",
        "## User Stories",
        "## Functional Requirements",
        "## Non-Functional Requirements",
        "## Acceptance Criteria",
        "## Assumptions / Constraints / Dependencies",
        "## Open Questions",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in spec: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Spec still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_plan(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"plan file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "Architecture Summary",
        "Components",
        "Data Model",
        "API Contracts",
        "Test Strategy",
        "Phases",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in plan: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Plan still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_test_plan(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"test plan file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "Overview",
        "Test Objectives",
        "Test Types and Approach",
        "Test Environment",
        "Test Data",
        "Success Criteria",
        "Reporting",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in test plan: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Test plan still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_implementation(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"implementation scaffold missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "Architecture Summary",
        "Components",
        "Data Model",
        "API Contracts",
        "Test Strategy",
        "Phases",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in implementation scaffold: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Implementation scaffold still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def check_feedback(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"feedback file missing: {path}"]
    text = path.read_text(encoding="utf-8")
    required_tokens = [
        "External / Internal Feedback",
        "Impacted Artifacts",
        "Risks / Issues Raised",
        "Actions / Follow-ups",
        "Decision Log",
    ]
    for token in required_tokens:
        if token not in text:
            errors.append(f"Missing section in feedback: {token}")
    if "[REQUIRES INPUT]" in text:
        errors.append("Feedback still contains [REQUIRES INPUT]; fill before publish.")
    return errors


def main():
    failures: list[str] = []
    failures.extend(check_intent(Path("intents/current/intent.md")))
    failures.extend(check_context(Path("contexts/current/context.md")))
    failures.extend(check_tasks(Path("tasks/current/tasks.md")))
    failures.extend(check_spec(Path("specs/current/spec.md")))
    failures.extend(check_plan(Path("plans/current/plan.md")))
    failures.extend(check_test_plan(Path("plans/current/test-plan.md")))
    failures.extend(check_implementation(Path("implementation/current/README.md")))
    failures.extend(check_feedback(Path("feedback/current/feedback.md")))
    if failures:
        for err in failures:
            print(f"❌ {err}")
        sys.exit(1)
    print("✅ All artifacts pass basic validation.")


if __name__ == "__main__":
    main()
