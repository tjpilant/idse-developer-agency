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
from datetime import datetime, timezone

PRIMARY_FILES = {
    "intent":   "projects/{project}/sessions/{session}/intents/intent.md",
    "context":  "projects/{project}/sessions/{session}/contexts/context.md",
    "spec":     "projects/{project}/sessions/{session}/specs/spec.md",
    "plan":     "projects/{project}/sessions/{session}/plans/plan.md",
    "tasks":    "projects/{project}/sessions/{session}/tasks/tasks.md",
    "implementation": "projects/{project}/sessions/{session}/implementation/README.md",
    "feedback": "projects/{project}/sessions/{session}/feedback/feedback.md",
}

LEGACY_FILES = {
    "intent":   "intents/projects/{project}/sessions/{session}/intent.md",
    "context":  "contexts/projects/{project}/sessions/{session}/context.md",
    "spec":     "specs/projects/{project}/sessions/{session}/spec.md",
    "plan":     "plans/projects/{project}/sessions/{session}/plan.md",
    "tasks":    "tasks/projects/{project}/sessions/{session}/tasks.md",
    "implementation": "implementation/projects/{project}/sessions/{session}/README.md",
    "feedback": "feedback/projects/{project}/sessions/{session}/feedback.md",
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


def resolve_session_from_pointer(project):
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


def main():
    p = argparse.ArgumentParser(description="Validate IDSE session artifacts (lightweight).")
    p.add_argument("--project", required=True)
    p.add_argument("--session", required=False, help="Session ID (can be omitted if --accept-projects-pointer is used)")
    p.add_argument("--accept-projects-pointer", action='store_true',
                   help="Allow reading session ID from projects/<project>/CURRENT_SESSION (transitional mode, Article X)")
    p.add_argument("--accept-stage-root", action='store_true',
                   help="Allow legacy stage-rooted paths during grace period (Article X Section 6)")
    p.add_argument("--report-dir", default=None, help="Directory to write reports. Defaults to ./reports/")
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
    report_dir = args.report_dir or os.path.join("reports", f"{project}_{session}_{int(datetime.now(timezone.utc).timestamp())}")

    results = []
    overall_ok = True

    path_map = {}
    legacy_used = []
    drift_detected = []

    for key, tmpl in PRIMARY_FILES.items():
        primary_path = tmpl.format(project=project, session=session)
        legacy_path = LEGACY_FILES.get(key, "").format(project=project, session=session)

        if os.path.isfile(primary_path):
            path_map[key] = primary_path
            if args.accept_stage_root and os.path.isfile(legacy_path) and legacy_path != primary_path:
                drift_detected.append((key, legacy_path))
        elif args.accept_stage_root and os.path.isfile(legacy_path):
            path_map[key] = legacy_path
            legacy_used.append((key, legacy_path))
        else:
            path_map[key] = primary_path

    for key, path in path_map.items():
        if os.path.isfile(path):
            results.append((key, path, True, "found"))
            content = read_file(path) or ""
            checks = SIMPLE_CHECKS.get(key, [])
            missing_checks = [c for c in checks if c and c not in content]
            if missing_checks:
                overall_ok = False
                results.append((f"{key}.content", path, False, f"missing markers: {missing_checks}"))
        else:
            overall_ok = False
            results.append((key, path, False, "missing"))

    if legacy_used:
        for key, path in legacy_used:
            results.append((f"{key}.legacy", path, False,
                           "using legacy stage-root path (grace period, migrate to projects-rooted)"))
            overall_ok = False

    if drift_detected:
        for key, path in drift_detected:
            results.append((f"{key}.drift", path, False,
                           "legacy and canonical both exist; verify canonical is source of truth"))
            overall_ok = False

    # Metadata check (Article X Section 8)
    metadata_dir = os.path.join("projects", project, "sessions", session, "metadata")
    required_metadata = [".owner", ".collaborators", "changelog.md", "project-readme.md", "review-checklist.md"]
    if not os.path.isdir(metadata_dir):
        overall_ok = False
        results.append(("metadata.dir", metadata_dir, False, "metadata directory missing (Article X Section 8)"))
    else:
        for fname in required_metadata:
            mpath = os.path.join(metadata_dir, fname)
            if os.path.isfile(mpath):
                results.append((f"metadata.{fname}", mpath, True, "found"))
            else:
                overall_ok = False
                results.append((f"metadata.{fname}", mpath, False, "missing (Article X Section 8)"))

    # Check pointer consistency (projects-rooted canonical)
    pointer_file = f"projects/{project}/CURRENT_SESSION"
    if os.path.isfile(pointer_file):
        missing_canonical = []
        for key, tmpl in PRIMARY_FILES.items():
            primary = tmpl.format(project=project, session=session)
            if not os.path.isfile(primary):
                missing_canonical.append(primary)

        if missing_canonical:
            overall_ok = False
            results.append(("pointer.consistency", pointer_file, False,
                           f"CURRENT_SESSION points to session but {len(missing_canonical)} canonical artifacts missing"))

    # summary text
    lines = []
    lines.append(f"validate-artifacts: project={project} session={session}")
    lines.append(f"report_dir: {report_dir}")
    mode_line = "mode: projects-root canonical"
    if args.accept_stage_root:
        mode_line += " (legacy stage-root accepted)"
    lines.append(mode_line)
    if args.accept_projects_pointer:
        lines.append(f"session_resolution: CURRENT_SESSION pointer allowed (Article X, Section 4)")
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
