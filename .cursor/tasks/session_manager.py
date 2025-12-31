#!/usr/bin/env python3
"""
IDSE SessionManager - Project Bootstrap & Session Creation
Implements Article X of the IDSE Constitution

This module provides the official mechanism for creating new IDSE project sessions
with complete folder scaffolding, maintaining canonical artifact locations.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

# Ensure repository root is on sys.path
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class SessionManager:
    """
    Manages IDSE project sessions and bootstrap operations.

    Authority: Article X, Section 2 - Only SessionManager may create sessions.
    """

    STAGES = ['intents', 'contexts', 'specs', 'plans', 'tasks', 'implementation', 'feedback']

    @staticmethod
    def create_session(project: str, session_name: str, owner: str) -> Dict[str, any]:
        """
        Create a new IDSE session with complete folder scaffolding.

        Implements Article X, Section 2-7 of IDSE Constitution.

        Args:
            project: Project name (e.g., 'IDSE_Core')
            session_name: Human-readable session identifier (e.g., 'puck-components')
            owner: Session owner username

        Returns:
            Dictionary containing:
                - session_id: The session identifier
                - project: Project name
                - canonical_paths: Dict mapping stage -> canonical path
                - project_readme: Path to project README
                - audit_file: Path to audit entry

        Raises:
            ValueError: If session_name is not provided
            RuntimeError: If session creation fails
        """
        # 1. Validate session name (Article X, Section 2)
        if not session_name:
            raise ValueError("session_name is required (human-readable format per Article X)")

        session_id = session_name

        print(f"🚀 Creating IDSE session: {project}/{session_id}")
        print(f"   Owner: {owner}")
        print(f"   Authority: Article X, Section 2")
        print()

        try:
            # 2. Create canonical stage directories (Article X, Section 3)
            canonical_paths = SessionManager._create_canonical_directories(project, session_id)

            # 3. Create project visibility folder
            project_dir = f"projects/{project}"
            os.makedirs(project_dir, exist_ok=True)

            # 4. Write project README
            readme_path = SessionManager._create_project_readme(project_dir, project, session_id)

            # 5. Write CURRENT_SESSION pointer (Article X, Section 4 - advisory only)
            SessionManager._write_current_session_pointer(project_dir, project, session_id)

            # 6. Write .owner marker (Article X, Section 7 - audit trace)
            SessionManager._write_owner_marker(canonical_paths['specs'], owner)

            # 7. Update .idse_active_session.json
            SessionManager._update_active_session(project, session_id, owner)

            # 8. Update current/ pointers (auto-sync all stages)
            SessionManager._update_current_pointers(project, session_id)

            # 9. Create audit entry (Article X, Section 7)
            audit_file = SessionManager._create_audit_entry(project, session_id, owner, canonical_paths)

            print("✅ Session creation complete")
            print(f"📋 Audit: {audit_file}")
            print()

            return {
                'session_id': session_id,
                'project': project,
                'canonical_paths': canonical_paths,
                'project_readme': readme_path,
                'audit_file': audit_file
            }

        except Exception as e:
            print(f"❌ Session creation failed: {e}")
            raise RuntimeError(f"Failed to create session {project}/{session_id}: {e}")

    @staticmethod
    def _create_canonical_directories(project: str, session_id: str) -> Dict[str, str]:
        """
        Create canonical stage-rooted directories per Article X, Section 3.

        Returns:
            Dict mapping stage name -> canonical path
        """
        canonical_paths = {}

        for stage in SessionManager.STAGES:
            path = f"{stage}/projects/{project}/sessions/{session_id}"
            os.makedirs(path, exist_ok=True)
            canonical_paths[stage] = path
            print(f"   📁 {stage:15} → {path}")

        print()
        return canonical_paths

    @staticmethod
    def _create_project_readme(project_dir: str, project: str, session_id: str) -> str:
        """Create or update project README."""
        readme_path = f"{project_dir}/README.md"

        if not os.path.exists(readme_path):
            with open(readme_path, 'w') as f:
                f.write(f"# {project}\n\n")
                f.write(f"Project initialized: {datetime.now(timezone.utc).isoformat()}\n\n")
                f.write(f"## Current Session\n\n")
                f.write(f"Session: `{session_id}`\n\n")
                f.write(f"## Sessions\n\n")
                f.write(f"- `{session_id}` (current)\n")
        else:
            # Update existing README with new session reference
            with open(readme_path, 'a') as f:
                f.write(f"- `{session_id}` (latest)\n")

        return readme_path

    @staticmethod
    def _write_current_session_pointer(project_dir: str, project: str, session_id: str):
        """
        Write CURRENT_SESSION pointer file (Article X, Section 4).

        Status: Advisory only - not canonical.
        """
        pointer_path = f"{project_dir}/CURRENT_SESSION"

        with open(pointer_path, 'w') as f:
            f.write(f"session_id: {session_id}\n")
            f.write(f"canonical_root: specs/projects/{project}/sessions/{session_id}\n")
            f.write(f"updated: {datetime.now(timezone.utc).isoformat()}\n")
            f.write(f"# Advisory pointer only - canonical artifacts are in stage-rooted paths\n")

        print(f"   📌 Advisory pointer: {pointer_path}")

    @staticmethod
    def _write_owner_marker(specs_path: str, owner: str):
        """Write .owner marker file for audit trace (Article X, Section 7)."""
        owner_file = f"{specs_path}/.owner"

        with open(owner_file, 'w') as f:
            f.write(owner)

        print(f"   👤 Owner marker: {owner_file}")

    @staticmethod
    def _update_active_session(project: str, session_id: str, owner: str):
        """Update .idse_active_session.json with new session."""
        session_file = Path(".idse_active_session.json")

        session_data = {
            "session_id": session_id,
            "name": session_id,
            "created_at": datetime.now(timezone.utc).timestamp(),
            "owner": owner,
            "project": project
        }

        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)

        print(f"   📝 Active session: {session_file}")

        # Also update sessions history
        SessionManager._update_sessions_history(project, session_id, owner)

    @staticmethod
    def _update_sessions_history(project: str, session_id: str, owner: str):
        """Update .idse_sessions_history.json."""
        history_file = Path(".idse_sessions_history.json")

        if history_file.exists():
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = {}

        if project not in history:
            history[project] = {}

        history[project][session_id] = {
            "created_at": datetime.now(timezone.utc).timestamp(),
            "owner": owner,
            "status": "active"
        }

        with open(history_file, 'w') as f:
            json.dump(history, f, indent=2)

    @staticmethod
    def _update_current_pointers(project: str, session_id: str):
        """
        Auto-update all current/ pointers to new session.

        Article X, Section 5 - Only SessionManager may create current/ paths.
        """
        print(f"   🔗 Updating current/ pointers...")

        for stage in SessionManager.STAGES:
            current_dir = f"{stage}/current"
            os.makedirs(current_dir, exist_ok=True)

            # Determine file name (strip 's' from plural stages except feedback)
            if stage == 'feedback':
                filename = 'feedback.md'
            elif stage == 'implementation':
                filename = 'README.md'  # implementation uses README
            else:
                filename = f"{stage.rstrip('s')}.md"

            pointer_file = f"{current_dir}/{filename}"

            # Write relative path pointer (matches existing pattern)
            with open(pointer_file, 'w') as f:
                relative_path = f"../projects/{project}/sessions/{session_id}/{filename}"
                f.write(relative_path)

    @staticmethod
    def _create_audit_entry(project: str, session_id: str, owner: str, canonical_paths: Dict[str, str]) -> str:
        """
        Create audit trail entry (Article X, Section 7).

        Returns:
            Path to audit file
        """
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S") + "Z"
        audit_dir = Path("idse-governance/feedback")
        audit_dir.mkdir(parents=True, exist_ok=True)

        audit_file = audit_dir / f"bootstrap_{project}_{timestamp}.md"

        with open(audit_file, 'w') as f:
            f.write(f"# Bootstrap Audit: {project} / {session_id}\n\n")
            f.write(f"**Created:** {datetime.now(timezone.utc).isoformat()}\n")
            f.write(f"**Owner:** {owner}\n")
            f.write(f"**Session ID:** {session_id}\n")
            f.write(f"**Authority:** Article X, Section 2 (IDSE Constitution)\n\n")

            f.write("## Canonical Paths Created:\n")
            for stage, path in canonical_paths.items():
                f.write(f"- {path}/\n")

            f.write(f"\n## Advisory Pointer:\n")
            f.write(f"- projects/{project}/CURRENT_SESSION → {session_id}\n")

            f.write(f"\n## Current Pointers Updated:\n")
            for stage in SessionManager.STAGES:
                if stage == 'feedback':
                    filename = 'feedback.md'
                elif stage == 'implementation':
                    filename = 'README.md'
                else:
                    filename = f"{stage.rstrip('s')}.md"

                f.write(f"- {stage}/current/{filename} → ../projects/{project}/sessions/{session_id}/{filename}\n")

            f.write(f"\n## Verification:\n")
            f.write(f"- [ ] .owner file created: specs/projects/{project}/sessions/{session_id}/.owner\n")
            f.write(f"- [ ] .idse_active_session.json updated\n")
            f.write(f"- [ ] All current/ pointers synchronized\n")
            f.write(f"- [ ] Validators pass: `python idse-governance/validate-artifacts.py --project {project} --session {session_id}`\n")

            f.write(f"\n---\n")
            f.write(f"*Generated by SessionManager v1.0.0*\n")

        return str(audit_file)


def main():
    """CLI entry point for SessionManager."""
    import argparse

    parser = argparse.ArgumentParser(
        description="IDSE SessionManager - Create new project sessions (Article X)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create a new session
  python session_manager.py IDSE_Core puck-components tjpilant

  # Create with environment owner
  python session_manager.py IDSE_Core my-feature $USER

Authority:
  Article X, Section 2 - Only SessionManager may create project sessions

See also:
  docs/02-idse-constitution.md - IDSE Constitution Article X
  .cursor/tasks/bootstrap_project.sh - Bash wrapper
        """
    )

    parser.add_argument('project', help='Project name (e.g., IDSE_Core)')
    parser.add_argument('session', help='Session name (human-readable, e.g., puck-components)')
    parser.add_argument('owner', help='Session owner username')
    parser.add_argument('--json', action='store_true', help='Output result as JSON')

    args = parser.parse_args()

    try:
        result = SessionManager.create_session(args.project, args.session, args.owner)

        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print("📌 Canonical paths:")
            for stage, path in result['canonical_paths'].items():
                print(f"   {stage:15} → {path}")
            print()
            print(f"📁 Project README: {result['project_readme']}")
            print(f"📋 Audit file: {result['audit_file']}")
            print()
            print("Next steps:")
            print(f"  1. Validate: python idse-governance/validate-artifacts.py --project {args.project} --accept-projects-pointer")
            print(f"  2. Begin IDSE pipeline: Start with Intent stage")

        sys.exit(0)

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
