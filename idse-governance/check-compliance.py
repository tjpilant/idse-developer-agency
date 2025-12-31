#!/usr/bin/env python3
"""
Lightweight compliance checks for IDSE sessions.

Usage:
  python3 idse-governance/check-compliance.py --project Project_Status_Browser --session session-1765832163 --report-dir reports/projects/Project_Status_Browser/sessions/session-1765832163
  python3 idse-governance/check-compliance.py --project P --accept-projects-pointer

Checks (minimal):
- Required session artifacts exist for the given project/session.
- Governance config marker present (.cursor/config/idse-governance.json).
- Flags placeholder tokens like [REQUIRES INPUT] if found.

This script is intentionally simple so it can run in CI/dev without extra deps.
"""

import argparse
import os
import sys
from pathlib import Path
from datetime import datetime, timezone


PRIMARY_ARTIFACTS = {
    "intent": "projects/{project}/sessions/{session}/intents/intent.md",
    "context": "projects/{project}/sessions/{session}/contexts/context.md",
    "spec": "projects/{project}/sessions/{session}/specs/spec.md",
    "plan": "projects/{project}/sessions/{session}/plans/plan.md",
    "test-plan": "projects/{project}/sessions/{session}/plans/test-plan.md",
    "tasks": "projects/{project}/sessions/{session}/tasks/tasks.md",
    "feedback": "projects/{project}/sessions/{session}/feedback/feedback.md",
    "implementation": "projects/{project}/sessions/{session}/implementation/README.md",
}

LEGACY_ARTIFACTS = {
    "intent": "intents/projects/{project}/sessions/{session}/intent.md",
    "context": "contexts/projects/{project}/sessions/{session}/context.md",
    "spec": "specs/projects/{project}/sessions/{session}/spec.md",
    "plan": "plans/projects/{project}/sessions/{session}/plan.md",
    "test-plan": "plans/projects/{project}/sessions/{session}/test-plan.md",
    "tasks": "tasks/projects/{project}/sessions/{session}/tasks.md",
    "feedback": "feedback/projects/{project}/sessions/{session}/feedback.md",
    "implementation": "implementation/projects/{project}/sessions/{session}/README.md",
}

GOVERNANCE_CONFIG = Path(".cursor/config/idse-governance.json")


def read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return None


def write_report(report_dir: Path, content: str) -> Path:
    report_dir.mkdir(parents=True, exist_ok=True)
    dest = report_dir / "check-compliance-report.txt"
    dest.write_text(content, encoding="utf-8")
    return dest


def resolve_session_from_pointer(project: str) -> str | None:
    """
    Read session-id from projects/<project>/CURRENT_SESSION if it exists.

    Returns:
        str | None: Session ID or None if pointer doesn't exist
    """
    pointer_file = f"projects/{project}/CURRENT_SESSION"
    if not os.path.isfile(pointer_file):
        return None

    try:
        with open(pointer_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('session_id:'):
                    return line.split(':', 1)[1].strip()
    except Exception:
        return None

    return None


def main() -> int:
    p = argparse.ArgumentParser(description="Check IDSE session compliance (lightweight).")
    p.add_argument("--project", required=True)
    p.add_argument("--session", required=False, help="Session ID (can be omitted if --accept-projects-pointer is used)")
    p.add_argument("--accept-projects-pointer", action='store_true',
                   help="Allow reading session ID from projects/<project>/CURRENT_SESSION (transitional mode, Article X)")
    p.add_argument("--accept-stage-root", action='store_true',
                   help="Allow legacy stage-rooted paths during grace period (Article X Section 6)")
    p.add_argument("--report-dir", default=None, help="Where to write the report (default: reports/<project>/<session>/)")
    args = p.parse_args()

    project = args.project

    # Resolve session ID (Article X, Section 4 - accept advisory pointer)
    if args.accept_projects_pointer:
        session = resolve_session_from_pointer(project)
        if session:
            print(f"ℹ️ Resolved session from pointer: {session}")
        else:
            print(f"⚠️ No CURRENT_SESSION pointer found for project: {project}")
            if not args.session:
                print("❌ Error: --session required when pointer not found")
                return 1
            session = args.session
    else:
        if not args.session:
            print("❌ Error: --session is required (or use --accept-projects-pointer)")
            return 1
        session = args.session

    report_dir = Path(args.report_dir) if args.report_dir else Path("reports") / project / session

    errors: list[str] = []
    warnings: list[str] = []

    # Governance config presence
    if not GOVERNANCE_CONFIG.exists():
        warnings.append(f"Governance config missing: {GOVERNANCE_CONFIG}")

    # Artifact presence and placeholder scan
    path_map: dict[str, Path] = {}
    legacy_used: list[str] = []
    drift: list[str] = []

    for key, template in PRIMARY_ARTIFACTS.items():
        primary = Path(template.format(project=project, session=session))
        legacy = Path(LEGACY_ARTIFACTS.get(key, "").format(project=project, session=session))

        if primary.exists():
            path_map[key] = primary
            if args.accept_stage_root and legacy.exists() and legacy != primary:
                drift.append(str(legacy))
        elif args.accept_stage_root and legacy.exists():
            path_map[key] = legacy
            legacy_used.append(str(legacy))
        else:
            path_map[key] = primary

    for key, path in path_map.items():
        if not path.exists():
            errors.append(f"Missing artifact: {path}")
            continue

        text = read_text(path) or ""
        if "[REQUIRES INPUT]" in text:
            warnings.append(f"Placeholder '[REQUIRES INPUT]' found in {path}")

    if legacy_used:
        errors.append("Legacy stage-root artifacts in use (grace period only): " + ", ".join(legacy_used))

    if drift:
        errors.append("Legacy artifacts present alongside canonical projects-root: " + ", ".join(drift))

    # Metadata (Article X Section 8)
    metadata_dir = Path(f"projects/{project}/sessions/{session}/metadata")
    required_metadata = [".owner", ".collaborators", "changelog.md", "project-readme.md", "review-checklist.md"]
    if not metadata_dir.exists():
        errors.append(f"Metadata directory missing: {metadata_dir} (Article X Section 8)")
    else:
        for fname in required_metadata:
            mpath = metadata_dir / fname
            if not mpath.exists():
                errors.append(f"Missing metadata file: {mpath} (Article X Section 8)")

    # Check if pointer exists but canonical artifacts missing (Article X warning)
    pointer_file = f"projects/{project}/CURRENT_SESSION"
    if os.path.isfile(pointer_file):
        missing_canonical = []
        for template in PRIMARY_ARTIFACTS.values():
            path = Path(template.format(project=project, session=session))
            if not path.exists():
                missing_canonical.append(str(path))

        if missing_canonical:
            errors.append(f"CURRENT_SESSION pointer exists but {len(missing_canonical)} canonical artifacts missing")

    lines: list[str] = []
    lines.append(f"check-compliance: project={project} session={session}")
    lines.append(f"report_dir: {report_dir}")
    mode_line = "mode: projects-root canonical"
    if args.accept_stage_root:
        mode_line += " (legacy stage-root accepted)"
    lines.append(mode_line)
    if args.accept_projects_pointer:
        lines.append("session_resolution: CURRENT_SESSION pointer allowed")
    lines.append(f"timestamp: {datetime.now(timezone.utc).isoformat()}")
    lines.append("")
    lines.append("Findings:")
    if errors:
        for err in errors:
            lines.append(f"ERROR: {err}")
    if warnings:
        for w in warnings:
            lines.append(f"WARNING: {w}")
    if not errors and not warnings:
        lines.append("OK: No compliance issues detected.")

    report_path = write_report(report_dir, "\n".join(lines))
    print(f"Report written: {report_path}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
