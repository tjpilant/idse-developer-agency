#!/usr/bin/env python3
"""
Migrate IDSE_Core/sessions/objective/ content to __blueprint__ session in Supabase.

This script:
1. Reads all documents from projects/IDSE_Core/sessions/objective/
2. Inserts them into the documents table with session_slug='__blueprint__'
3. Updates the blueprint session's state_json based on which files exist

Run from repository root:
    python3 backend/scripts/migrate_objective_to_blueprint.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid

# Load environment
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Paths
REPO_ROOT = Path(__file__).parent.parent.parent
OBJECTIVE_DIR = REPO_ROOT / "projects" / "IDSE_Core" / "sessions" / "objective"

# Stage mapping (file path -> stage name)
STAGE_FILES = {
    "intents/intent.md": "intent",
    "contexts/context.md": "context",
    "specs/spec.md": "spec",
    "plans/plan.md": "plan",
    "tasks/tasks.md": "tasks",
    "feedback/feedback.md": "feedback",
}

def get_idse_core_project_id():
    """Get the UUID for IDSE_Core project."""
    result = supabase.table("projects").select("id").eq("name", "IDSE_Core").execute()
    if not result.data:
        print("❌ Error: IDSE_Core project not found in Supabase")
        sys.exit(1)
    return result.data[0]["id"]

def read_file(file_path: Path) -> str:
    """Read file content."""
    if not file_path.exists():
        return ""
    return file_path.read_text(encoding="utf-8")

def migrate_documents(project_id: str):
    """Migrate all documents from objective/ to __blueprint__."""
    print("\n📂 Migrating documents from objective/ to __blueprint__...")

    migrated_count = 0
    stage_statuses = {}

    # Migrate meta.md (special case - not in a stage folder)
    meta_file = OBJECTIVE_DIR / "meta.md"
    if meta_file.exists():
        content = read_file(meta_file)
        print(f"   📄 Migrating meta.md ({len(content)} chars)")

        supabase.table("documents").upsert({
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "session_slug": "__blueprint__",
            "path": "meta.md",
            "stage": "meta",
            "content": content,
        }, on_conflict="project_id,session_slug,path").execute()

        migrated_count += 1

    # Migrate stage documents
    for file_path, stage in STAGE_FILES.items():
        full_path = OBJECTIVE_DIR / file_path

        if full_path.exists():
            content = read_file(full_path)
            print(f"   📄 Migrating {file_path} ({len(content)} chars)")

            supabase.table("documents").upsert({
                "id": str(uuid.uuid4()),
                "project_id": project_id,
                "session_slug": "__blueprint__",
                "path": file_path,
                "stage": stage,
                "content": content,
            }, on_conflict="project_id,session_slug,path").execute()

            migrated_count += 1

            # Mark stage as complete if file has substantial content
            if len(content.strip()) > 100:  # More than 100 chars = considered complete
                stage_statuses[stage] = "complete"
            else:
                stage_statuses[stage] = "in_progress"
        else:
            stage_statuses[stage] = "pending"

    # Migrate implementation documents (all files in implementation/)
    impl_dir = OBJECTIVE_DIR / "implementation"
    if impl_dir.exists():
        for impl_file in impl_dir.glob("*.md"):
            content = read_file(impl_file)
            file_name = impl_file.name

            print(f"   📄 Migrating implementation/{file_name} ({len(content)} chars)")

            supabase.table("documents").upsert({
                "id": str(uuid.uuid4()),
                "project_id": project_id,
                "session_slug": "__blueprint__",
                "path": f"implementation/{file_name}",
                "stage": "implementation",
                "content": content,
            }, on_conflict="project_id,session_slug,path").execute()

            migrated_count += 1

        # Mark implementation as complete if README exists
        if (impl_dir / "README.md").exists():
            stage_statuses["implementation"] = "complete"
        else:
            stage_statuses["implementation"] = "in_progress"
    else:
        stage_statuses["implementation"] = "pending"

    print(f"   ✅ Migrated {migrated_count} documents")
    return stage_statuses

def update_blueprint_state(project_id: str, stage_statuses: dict):
    """Update the blueprint session's state_json based on migrated files."""
    print("\n📊 Updating blueprint session state...")

    # Calculate progress
    total_stages = len(stage_statuses)
    complete_stages = sum(1 for status in stage_statuses.values() if status == "complete")
    progress_percent = int((complete_stages / total_stages) * 100) if total_stages > 0 else 0

    # Build state_json
    state_json = {
        "stages": stage_statuses,
        "last_agent": "migration_script",
        "progress_percent": progress_percent
    }

    # Update blueprint session
    result = supabase.table("sessions").update({
        "state_json": state_json
    }).eq("project_id", project_id).eq("session_id", "__blueprint__").execute()

    if result.data:
        print(f"   ✅ Blueprint state updated: {progress_percent}% complete ({complete_stages}/{total_stages} stages)")
        print(f"   📋 Stage statuses:")
        for stage, status in sorted(stage_statuses.items()):
            status_icon = "✅" if status == "complete" else "🔄" if status == "in_progress" else "⏸️"
            print(f"      {status_icon} {stage}: {status}")
    else:
        print("   ❌ Failed to update blueprint state")

def main():
    print("=" * 70)
    print("🔄 MIGRATE OBJECTIVE SESSION TO BLUEPRINT")
    print("=" * 70)
    print(f"Source: {OBJECTIVE_DIR}")
    print(f"Target: Supabase documents table (session_slug='__blueprint__')")
    print("=" * 70)

    # Check if objective directory exists
    if not OBJECTIVE_DIR.exists():
        print(f"❌ Error: {OBJECTIVE_DIR} does not exist")
        sys.exit(1)

    # Get IDSE_Core project ID
    project_id = get_idse_core_project_id()
    print(f"\n✅ Found IDSE_Core project: {project_id}")

    # Migrate documents
    stage_statuses = migrate_documents(project_id)

    # Update blueprint state
    update_blueprint_state(project_id, stage_statuses)

    print("\n" + "=" * 70)
    print("✅ MIGRATION COMPLETE!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Refresh your browser")
    print("2. Select 'IDSE_Core' project")
    print("3. Select '📘 Project Blueprint (IDD)' session")
    print("4. You should see real pipeline progress and documents!")
    print()

if __name__ == "__main__":
    main()
