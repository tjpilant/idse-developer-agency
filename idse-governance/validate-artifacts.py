#!/usr/bin/env python3
"""
Lightweight artifact validator for IDSE sessions.

Usage:
  python3 idse-governance/validate-artifacts.py --project Project_Status_Browser --session session-1765832163
  python3 idse-governance/validate-artifacts.py --project P --session S --report-dir implementation/.../reports/

This script is intentionally minimal and dependency-free so it can run in CI or locally.
"""

import argparse
import sys
import os
from datetime import datetime

REQUIRED_FILES = {
    "intent":   "intents/projects/{project}/sessions/{session}/intent.md",
    "context":  "contexts/projects/{project}/sessions/{session}/context.md",
    "spec":     "specs/projects/{project}/sessions/{session}/spec.md",
    "plan":     "plans/projects/{project}/sessions/{session}/plan.md",
    "tasks":    "tasks/projects/{project}/sessions/{session}/tasks.md",
}

SIMPLE_CHECKS = {
    "intent": ["# Intent", "Overview"],
    "context": ["# Context", "Technical Environment"],
    "spec": ["# Specification", "Acceptance Criteria", "Overview"],
    "plan": ["# Implementation Plan", "Phases"],
    "tasks": ["# Tasks", "Phase"],
}


def read_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return None


def write_report(report_dir, name, content):
    os.makedirs(report_dir, exist_ok=True)
    path = os.path.join(report_dir, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def main():
    p = argparse.ArgumentParser(description="Validate IDSE session artifacts (lightweight).")
    p.add_argument("--project", required=True)
    p.add_argument("--session", required=True)
    p.add_argument("--report-dir", default=None, help="Directory to write reports. Defaults to ./reports/")
    args = p.parse_args()

    project = args.project
    session = args.session
    report_dir = args.report_dir or os.path.join("reports", f"{project}_{session}_{int(datetime.utcnow().timestamp())}")

    results = []
    overall_ok = True

    for key, tmpl in REQUIRED_FILES.items():
        path = tmpl.format(project=project, session=session)
        if os.path.isfile(path):
            results.append((key, path, True, "found"))
            # basic content checks
            content = read_file(path) or ""
            checks = SIMPLE_CHECKS.get(key, [])
            missing_checks = [c for c in checks if c and c not in content]
            if missing_checks:
                overall_ok = False
                results.append((f"{key}.content", path, False, f"missing markers: {missing_checks}"))
        else:
            overall_ok = False
            results.append((key, path, False, "missing"))

    # summary text
    lines = []
    lines.append(f"validate-artifacts: project={project} session={session}")
    lines.append(f"report_dir: {report_dir}")
    lines.append("")
    lines.append("Checks:")
    for r in results:
        name, path, ok, note = r
        lines.append(f" - {name}: {'OK' if ok else 'FAIL'} -> {path} ({note})")
    lines.append("")
    lines.append("Overall: " + ("PASS" if overall_ok else "FAIL"))
    summary = "\n".join(lines)

    # write report
    report_path = write_report(report_dir, "validate-artifacts-report.txt", summary)
    print(summary)
    print("")
    print(f"Report written: {report_path}")

    return 0 if overall_ok else 2


if __name__ == "__main__":
    sys.exit(main())
