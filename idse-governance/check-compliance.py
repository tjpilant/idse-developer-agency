#!/usr/bin/env python3
"""
Lightweight compliance checks for IDSE sessions.

Usage:
  python3 idse-governance/check-compliance.py --project Project_Status_Browser --session session-1765832163 --report-dir reports/projects/Project_Status_Browser/sessions/session-1765832163

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


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True)
    p.add_argument("--session", required=True)
    p.add_argument("--report-dir", default=None, help="Where to write the report (default: reports/<project>/<session>/)")
    args = p.parse_args()

    project = args.project
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

    lines: list[str] = []
    lines.append(f"check-compliance: project={project} session={session}")
    lines.append(f"report_dir: {report_dir}")
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
