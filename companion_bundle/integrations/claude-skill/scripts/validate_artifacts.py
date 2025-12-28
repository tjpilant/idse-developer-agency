#!/usr/bin/env python3
"""
IDSE Artifact Validator (session-aware)

Checks IDSE artifacts for unresolved [REQUIRES INPUT] markers
with support for Agency session paths and simple fallbacks.

Usage:
    python validate_artifacts.py <directory>
    python validate_artifacts.py ./project/
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from session_reader import SessionReader  # noqa: E402
from utils.doc_reader import IDSEDocReader  # noqa: E402
from guardrails.instruction_protection import (  # noqa: E402
    idse_boundary_guardrail,
)
from utils.template_writer import TemplateWriter  # noqa: E402

STAGE_ORDER = ["intent", "context", "spec", "plan", "tasks"]
STAGE_DEPENDENCIES = {
    "intent": [],
    "context": ["intent"],
    "spec": ["intent", "context"],
    "plan": ["spec"],
    "tasks": ["plan"],
}
STAGE_FILES = {
    "intent": ("intents", "intent.md"),
    "context": ("contexts", "context.md"),
    "spec": ("specs", "spec.md"),
    "plan": ("plans", "plan.md"),
    "tasks": ("tasks", "tasks.md"),
}


def find_requires_input(content: str) -> list[tuple[int, str]]:
    """Find all [REQUIRES INPUT] markers with line numbers."""
    results = []
    for i, line in enumerate(content.split("\n"), 1):
        if "[REQUIRES INPUT]" in line:
            results.append((i, line.strip()))
    return results


def validate_artifact(path: Path) -> dict:
    """Validate a single artifact file."""
    is_safe, message = idse_boundary_guardrail(str(path), "read")
    if not is_safe:
        raise PermissionError(message)

    content = path.read_text()
    stage = path.stem.lower()
    is_draft = TemplateWriter.is_draft(content)

    issues = find_requires_input(content)

    return {
        "path": str(path),
        "stage": stage,
        "valid": True if is_draft else len(issues) == 0,
        "unresolved_count": len(issues),
        "issues": issues,
        "draft": is_draft,
    }


def validate_directory(directory: str) -> dict:
    """Validate all IDSE artifacts in a directory (session-aware)."""
    dir_path = Path(directory)
    reader = IDSEDocReader(base_dir=dir_path)

    results = {
        "directory": directory,
        "artifacts": [],
        "ready_for_next_stage": None,
        "total_unresolved": 0,
        "session": SessionReader.get_active_session(base_dir=dir_path),
    }

    found_stages = {}

    for stage in STAGE_ORDER:
        stage_dir, filename = STAGE_FILES[stage]
        artifact_path = reader.resolve(stage_dir, filename)

        if not artifact_path:
            continue

        validation = validate_artifact(artifact_path)
        results["artifacts"].append(validation)
        results["total_unresolved"] += validation["unresolved_count"]
        found_stages[stage] = validation["valid"]

    # Determine which stage is ready
    current_stage = None
    for stage in STAGE_ORDER:
        if stage in found_stages:
            if found_stages[stage]:
                current_stage = stage
            else:
                break
        else:
            break

    if current_stage:
        idx = STAGE_ORDER.index(current_stage)
        if idx < len(STAGE_ORDER) - 1:
            results["ready_for_next_stage"] = STAGE_ORDER[idx + 1]
        else:
            results["ready_for_next_stage"] = "implementation"
    else:
        results["ready_for_next_stage"] = "intent"

    return results


def print_report(results: dict):
    """Print validation report."""
    print(f"\n📋 IDSE Artifact Validation: {results['directory']}")
    print("=" * 50)

    if results.get("session"):
        session = results["session"]
        print(
            f"Session: {session.get('session_id')} | "
            f"Project: {session.get('project')}"
        )

    if not results["artifacts"]:
        print("❌ No IDSE artifacts found")
        print("   Next step: Generate intent.md")
        return

    for artifact in results["artifacts"]:
        status = "✅" if artifact["valid"] else "❌"
        if artifact.get("draft"):
            status = "⚠️"

        print(f"\n{status} {artifact['stage']}.md ({artifact['path']})")

        if artifact["issues"]:
            print(f"   {artifact['unresolved_count']} unresolved markers:")
            for line_num, line in artifact["issues"][:5]:
                truncated = line[:60] + "..." if len(line) > 60 else line
                print(f"     Line {line_num}: {truncated}")
            if len(artifact["issues"]) > 5:
                print(f"     ... and {len(artifact['issues']) - 5} more")

        if artifact.get("draft"):
            print("   Draft: marked [DRAFT - PENDING AGENCY REVIEW] (warning only)")

    print("\n" + "-" * 50)
    print(f"Total unresolved: {results['total_unresolved']}")
    print(f"Ready for: {results['ready_for_next_stage']}")

    if results["total_unresolved"] == 0:
        print("✅ All artifacts complete!")
    else:
        print("⚠️  Resolve [REQUIRES INPUT] markers before proceeding")


def main():
    parser = argparse.ArgumentParser(
        description="Validate IDSE artifacts for completeness"
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Directory containing IDSE artifacts",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON",
    )

    args = parser.parse_args()

    results = validate_directory(args.directory)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit with error if unresolved markers exist
    sys.exit(0 if results["total_unresolved"] == 0 else 1)


if __name__ == "__main__":
    main()
