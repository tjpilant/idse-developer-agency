#!/usr/bin/env python3
"""
migrate_stage_to_projects.py

Purpose:
    Migrate legacy stage-rooted IDSE artifacts into the projects-root canonical layout:
    from: <stage>/projects/<project>/sessions/<session>/...
    to:   projects/<project>/sessions/<session>/<stage>/...

Features:
    - Dry-run by default (no file moves unless --execute)
    - Copies files; does not delete legacy files (safe, reversible)
    - Audit log per run under idse-governance/feedback/migration_<project>_<session>_<timestamp>.md
    - Reports missing legacy artifacts

Usage:
    python3 scripts/migrate_stage_to_projects.py --project IDSE_Core --session milkdown-crepe
    python3 scripts/migrate_stage_to_projects.py --project IDSE_Core --session milkdown-crepe --execute

Notes:
    - This is transitional per Article X Section 6. After grace, legacy paths should be removed/blocked.
    - Timestamps are UTC; audit includes copy actions and missing artifacts.
"""

import argparse
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

STAGES = ["intents", "contexts", "specs", "plans", "tasks", "implementation", "feedback"]
FILENAMES = {
    "intents": "intent.md",
    "contexts": "context.md",
    "specs": "spec.md",
    "plans": "plan.md",
    "tasks": "tasks.md",
    "implementation": "README.md",
    "feedback": "feedback.md",
}


def stage_root_path(project: str, session: str, stage: str) -> Path:
    return Path(f"{stage}/projects/{project}/sessions/{session}")


def projects_root_path(project: str, session: str, stage: str) -> Path:
    return Path(f"projects/{project}/sessions/{session}/{stage}")


def migrate(project: str, session: str, execute: bool) -> Tuple[List[str], List[str]]:
    copied: List[str] = []
    missing: List[str] = []

    for stage in STAGES:
        legacy_dir = stage_root_path(project, session, stage)
        canonical_dir = projects_root_path(project, session, stage)
        filename = FILENAMES[stage]

        legacy_file = legacy_dir / filename
        canonical_file = canonical_dir / filename

        if not legacy_file.exists():
            missing.append(str(legacy_file))
            continue

        canonical_dir.mkdir(parents=True, exist_ok=True)

        if execute:
            shutil.copy2(legacy_file, canonical_file)
        copied.append(f"{legacy_file} -> {canonical_file}")

    return copied, missing


def write_audit(project: str, session: str, copied: List[str], missing: List[str], execute: bool) -> Path:
    audit_dir = Path("idse-governance/feedback")
    audit_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")
    audit_file = audit_dir / f"migration_{project}_{session}_{ts}.md"

    with audit_file.open("w", encoding="utf-8") as f:
        f.write(f"# Stage-root to Projects-root Migration\n\n")
        f.write(f"**Project:** {project}\n")
        f.write(f"**Session:** {session}\n")
        f.write(f"**When:** {datetime.now(timezone.utc).isoformat()}\n")
        f.write(f"**Mode:** {'execute' if execute else 'dry-run'}\n")
        f.write(f"**Authority:** Article X Section 6 grace policy\n\n")

        f.write("## Copied\n")
        if copied:
            for line in copied:
                f.write(f"- {line}\n")
        else:
            f.write("- None\n")

        f.write("\n## Missing legacy artifacts\n")
        if missing:
            for line in missing:
                f.write(f"- {line}\n")
        else:
            f.write("- None\n")

        f.write("\n## Notes\n")
        f.write("- Legacy files are left in place; remove after validation.\n")
        f.write("- Re-run validators in projects-root mode after migration.\n")

    return audit_file


def main():
    parser = argparse.ArgumentParser(description="Migrate legacy stage-root artifacts to projects-root canonical layout.")
    parser.add_argument("--project", required=True, help="Project name")
    parser.add_argument("--session", required=True, help="Session name")
    parser.add_argument("--execute", action="store_true", help="Copy files (otherwise dry-run)")
    args = parser.parse_args()

    copied, missing = migrate(args.project, args.session, args.execute)
    audit_file = write_audit(args.project, args.session, copied, missing, args.execute)

    print(f"Mode: {'EXECUTE' if args.execute else 'DRY-RUN'}")
    print(f"Copied: {len(copied)}; Missing: {len(missing)}")
    if copied:
        print("Copied paths:")
        for line in copied:
            print(f"  {line}")
    if missing:
        print("Missing legacy:")
        for line in missing:
            print(f"  {line}")
    print(f"Audit: {audit_file}")


if __name__ == "__main__":
    main()
