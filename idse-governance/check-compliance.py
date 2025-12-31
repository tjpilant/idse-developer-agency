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
from datetime import datetime


REQUIRED_ARTIFACTS = [
    "intents/projects/{project}/sessions/{session}/intent.md",
    "contexts/projects/{project}/sessions/{session}/context.md",
    "specs/projects/{project}/sessions/{session}/spec.md",
    "plans/projects/{project}/sessions/{session}/plan.md",
    "plans/projects/{project}/sessions/{session}/test-plan.md",
    "tasks/projects/{project}/sessions/{session}/tasks.md",
    "feedback/projects/{project}/sessions/{session}/feedback.md",
    "implementation/projects/{project}/sessions/{session}/README.md",
]

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
    for template in REQUIRED_ARTIFACTS:
        path = Path(template.format(project=project, session=session))
        if not path.exists():
            errors.append(f"Missing artifact: {path}")
            continue
        text = read_text(path) or ""
        if "[REQUIRES INPUT]" in text:
            warnings.append(f"Placeholder '[REQUIRES INPUT]' found in {path}")

    # Check if pointer exists but canonical artifacts missing (Article X warning)
    if args.accept_projects_pointer:
        pointer_file = f"projects/{project}/CURRENT_SESSION"
        if os.path.isfile(pointer_file):
            missing_canonical = []
            for template in REQUIRED_ARTIFACTS:
                path = Path(template.format(project=project, session=session))
                if not path.exists():
                    missing_canonical.append(str(path))

            if missing_canonical:
                errors.append(f"CURRENT_SESSION pointer exists but {len(missing_canonical)} canonical artifacts missing")

    lines: list[str] = []
    lines.append(f"check-compliance: project={project} session={session}")
    lines.append(f"report_dir: {report_dir}")
    if args.accept_projects_pointer:
        lines.append(f"mode: transitional (Article X, Section 4)")
    lines.append(f"timestamp: {datetime.utcnow().isoformat()}Z")
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
