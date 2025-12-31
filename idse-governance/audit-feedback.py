#!/usr/bin/env python3
"""
Feedback audit for IDSE sessions.

Usage:
  python3 idse-governance/audit-feedback.py --project Project_Status_Browser --session session-1765832163 --report-dir reports/projects/Project_Status_Browser/sessions/session-1765832163

Checks:
- feedback.md exists for the project/session.
- Required sections are present (External / Internal Feedback, Impacted Artifacts, Risks / Issues Raised, Actions / Follow-ups, Decision Log).
- Flags placeholder tokens like [REQUIRES INPUT].
"""

import argparse
import sys
from pathlib import Path
from datetime import datetime

REQUIRED_SECTIONS = [
    "External / Internal Feedback",
    "Impacted Artifacts",
    "Risks / Issues Raised",
    "Actions / Follow-ups",
    "Decision Log",
]


def write_report(report_dir: Path, content: str) -> Path:
    report_dir.mkdir(parents=True, exist_ok=True)
    dest = report_dir / "audit-feedback-report.txt"
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

    feedback_path = Path(f"projects/{project}/sessions/{session}/feedback/feedback.md")
    if not feedback_path.exists():
        errors.append(f"Missing feedback file: {feedback_path}")
    else:
        text = feedback_path.read_text(encoding="utf-8")
        for section in REQUIRED_SECTIONS:
            if section not in text:
                errors.append(f"Missing section in feedback: {section}")
        if "[REQUIRES INPUT]" in text:
            warnings.append(f"Feedback contains placeholder [REQUIRES INPUT]: {feedback_path}")

    lines: list[str] = []
    lines.append(f"audit-feedback: project={project} session={session}")
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
        lines.append("OK: Feedback meets required sections.")

    report_path = write_report(report_dir, "\n".join(lines))
    print(f"Report written: {report_path}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
