#!/usr/bin/env python3
"""
Seed Documents from Filesystem to Supabase

Scans projects/*/sessions/*/ directories and uploads all .md files
to the documents table in Supabase.

Usage:
    python backend/scripts/seed_documents.py [--dry-run]
"""

import os
import sys
from pathlib import Path
from typing import Optional
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.services.supabase_client import get_supabase_client

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


# Standard IDSE pipeline document paths
STANDARD_DOCUMENTS = [
    "intents/intent.md",
    "contexts/context.md",
    "specs/spec.md",
    "plans/plan.md",
    "tasks/tasks.md",
    "feedback/feedback.md",
    "implementation/README.md",
]

# Stage mapping from path
STAGE_MAP = {
    "intents/intent.md": "intent",
    "contexts/context.md": "context",
    "specs/spec.md": "spec",
    "plans/plan.md": "plan",
    "tasks/tasks.md": "tasks",
    "feedback/feedback.md": "feedback",
    "implementation/README.md": "implementation",
}


def get_project_uuid(supabase, project_name: str) -> Optional[str]:
    """Get project UUID by name."""
    try:
        resp = supabase.table("projects").select("id").eq("name", project_name).limit(1).execute()
        if resp.data:
            return resp.data[0]["id"]
    except Exception as e:
        logger.error(f"Error fetching project UUID for {project_name}: {e}")
    return None


def seed_documents(dry_run: bool = False):
    """Scan filesystem and seed documents to Supabase."""

    supabase = get_supabase_client()
    projects_root = Path("projects")

    if not projects_root.exists():
        logger.error("projects/ directory not found")
        return

    total_docs = 0
    inserted_docs = 0
    skipped_docs = 0

    # Scan all projects
    for project_dir in sorted(projects_root.iterdir()):
        if not project_dir.is_dir():
            continue

        project_name = project_dir.name
        logger.info(f"\n📁 Processing project: {project_name}")

        # Get project UUID
        project_uuid = get_project_uuid(supabase, project_name)
        if not project_uuid:
            logger.warning(f"  ⚠️  Project '{project_name}' not found in Supabase, skipping")
            continue

        # Find sessions directory
        sessions_dir = project_dir / "sessions"
        if not sessions_dir.exists():
            # Try old structure (sessions directly under project)
            logger.warning(f"  ⚠️  No sessions/ directory found, checking for old structure")
            # Look for session-* directories directly under project
            session_dirs = list(project_dir.glob("session-*"))
            if session_dirs:
                logger.info(f"  Found {len(session_dirs)} sessions in old structure")
                sessions_dir = project_dir
            else:
                logger.warning(f"  No sessions found, skipping")
                continue

        # Process each session
        for session_dir in sorted(sessions_dir.iterdir()):
            if not session_dir.is_dir():
                continue

            session_slug = session_dir.name
            logger.info(f"  📄 Session: {session_slug}")

            # Scan for markdown files
            for doc_path_str in STANDARD_DOCUMENTS:
                doc_file = session_dir / doc_path_str

                if not doc_file.exists():
                    logger.debug(f"    ⊗ {doc_path_str} (not found)")
                    continue

                # Read content
                try:
                    content = doc_file.read_text(encoding='utf-8')
                except Exception as e:
                    logger.error(f"    ✗ {doc_path_str} (read error: {e})")
                    skipped_docs += 1
                    continue

                total_docs += 1
                stage = STAGE_MAP.get(doc_path_str)

                if dry_run:
                    logger.info(f"    ✓ {doc_path_str} ({len(content)} chars) [DRY RUN]")
                    continue

                # Upsert to Supabase
                try:
                    record = {
                        "project_id": project_uuid,
                        "session_slug": session_slug,
                        "path": doc_path_str,
                        "stage": stage,
                        "content": content,
                        "metadata": {}
                    }

                    resp = supabase.table("documents").upsert(
                        record,
                        on_conflict="project_id,session_slug,path"
                    ).execute()

                    if resp.data:
                        logger.info(f"    ✓ {doc_path_str} ({len(content)} chars)")
                        inserted_docs += 1
                    else:
                        logger.warning(f"    ⚠️  {doc_path_str} (upsert returned no data)")
                        skipped_docs += 1

                except Exception as e:
                    logger.error(f"    ✗ {doc_path_str} (DB error: {e})")
                    skipped_docs += 1

    # Summary
    logger.info(f"\n{'='*60}")
    logger.info(f"Summary:")
    logger.info(f"  Total documents found: {total_docs}")
    if not dry_run:
        logger.info(f"  Inserted/Updated: {inserted_docs}")
        logger.info(f"  Skipped: {skipped_docs}")
    else:
        logger.info(f"  DRY RUN - No changes made")
    logger.info(f"{'='*60}\n")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed documents from filesystem to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")

    args = parser.parse_args()

    try:
        seed_documents(dry_run=args.dry_run)
    except KeyboardInterrupt:
        logger.info("\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        sys.exit(1)
