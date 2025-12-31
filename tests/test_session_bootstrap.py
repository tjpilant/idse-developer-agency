#!/usr/bin/env python3
"""
Integration tests for SessionManager bootstrap functionality.

Tests Article X compliance: Project Bootstrap & Canonical Artifact Mapping
"""

import json
import os
import shutil
import sys
import unittest
from datetime import datetime
from pathlib import Path

# Ensure .cursor/tasks is on sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".cursor" / "tasks"))

from session_manager import SessionManager


class TestSessionBootstrap(unittest.TestCase):
    """Test suite for SessionManager.create_session() functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_project = "TestProject"
        self.test_session = "test-session"
        self.test_owner = "test-owner"
        self.root = ROOT

    def tearDown(self):
        """Clean up test artifacts."""
        paths_to_clean = [
            self.root / "projects" / self.test_project,
            self.root / "intents" / "projects" / self.test_project,
            self.root / "contexts" / "projects" / self.test_project,
            self.root / "specs" / "projects" / self.test_project,
            self.root / "plans" / "projects" / self.test_project,
            self.root / "tasks" / "projects" / self.test_project,
            self.root / "implementation" / "projects" / self.test_project,
            self.root / "feedback" / "projects" / self.test_project,
        ]

        for path in paths_to_clean:
            if path.exists():
                shutil.rmtree(path)

        # Clean up current/ pointers
        for stage in SessionManager.STAGES:
            current_dir = self.root / stage / "current"
            if current_dir.exists():
                # Remove test-specific pointer files if they exist
                if stage == 'feedback':
                    filename = 'feedback.md'
                elif stage == 'implementation':
                    filename = 'README.md'
                else:
                    filename = f"{stage.rstrip('s')}.md"

                pointer_file = current_dir / filename
                if pointer_file.exists():
                    # Only remove if it points to our test project
                    try:
                        content = pointer_file.read_text()
                        if self.test_project in content:
                            pointer_file.unlink()
                    except Exception:
                        pass

        # Clean up audit entries
        audit_dir = self.root / "idse-governance" / "feedback"
        if audit_dir.exists():
            for audit_file in audit_dir.glob(f"bootstrap_{self.test_project}_*.md"):
                audit_file.unlink()

    def test_create_session_scaffolds_all_stages(self):
        """Test that create_session() creates all 7 stage directories."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        # Verify session_id returned
        self.assertEqual(result['session_id'], self.test_session)
        self.assertEqual(result['project'], self.test_project)

        # Verify all stage directories created (Article X, Section 3)
        for stage in SessionManager.STAGES:
            path = self.root / stage / "projects" / self.test_project / "sessions" / self.test_session
            self.assertTrue(path.exists(), f"Missing canonical path: {path}")
            self.assertTrue(path.is_dir(), f"Path is not a directory: {path}")

    def test_creates_project_readme(self):
        """Test that project README is created in visibility folder."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        readme = self.root / "projects" / self.test_project / "README.md"
        self.assertTrue(readme.exists(), "Project README not created")

        content = readme.read_text()
        self.assertIn(f"# {self.test_project}", content)
        self.assertIn(self.test_session, content)

    def test_creates_current_session_pointer(self):
        """Test that CURRENT_SESSION advisory pointer is created (Article X, Section 4)."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        pointer = self.root / "projects" / self.test_project / "CURRENT_SESSION"
        self.assertTrue(pointer.exists(), "CURRENT_SESSION pointer not created")

        content = pointer.read_text()
        self.assertIn(f"session_id: {self.test_session}", content)
        self.assertIn(f"canonical_root: projects/{self.test_project}/sessions/{self.test_session}", content)
        self.assertIn("Canonical root is projects-rooted", content)

    def test_creates_owner_marker(self):
        """Test that .owner marker is created for audit trail (Article X, Section 7)."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        owner_file = self.root / "projects" / self.test_project / "sessions" / self.test_session / "specs" / ".owner"
        self.assertTrue(owner_file.exists(), ".owner marker not created")

        owner_content = owner_file.read_text().strip()
        self.assertEqual(owner_content, self.test_owner)

    def test_updates_active_session_json(self):
        """Test that .idse_active_session.json is updated."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        active_session_file = self.root / ".idse_active_session.json"
        self.assertTrue(active_session_file.exists(), ".idse_active_session.json not updated")

        with open(active_session_file, 'r') as f:
            data = json.load(f)

        self.assertEqual(data['session_id'], self.test_session)
        self.assertEqual(data['project'], self.test_project)
        self.assertEqual(data['owner'], self.test_owner)
        self.assertIn('created_at', data)

    def test_updates_sessions_history(self):
        """Test that .idse_sessions_history.json is updated."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        history_file = self.root / ".idse_sessions_history.json"
        self.assertTrue(history_file.exists(), ".idse_sessions_history.json not updated")

        with open(history_file, 'r') as f:
            history = json.load(f)

        self.assertIn(self.test_project, history)
        self.assertIn(self.test_session, history[self.test_project])
        self.assertEqual(history[self.test_project][self.test_session]['owner'], self.test_owner)
        self.assertEqual(history[self.test_project][self.test_session]['status'], 'active')

    def test_updates_current_pointers(self):
        """Test that all current/ pointers are auto-synchronized (Article X, Section 5)."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        # Check all stage current/ pointers
        for stage in SessionManager.STAGES:
            filename = SessionManager.FILE_NAMES[stage]

            pointer_file = self.root / stage / "current" / filename
            self.assertTrue(pointer_file.exists(), f"Current pointer not created: {pointer_file}")

            content = pointer_file.read_text().strip()
            expected_path = f"../../projects/{self.test_project}/sessions/{self.test_session}/{stage}/{filename}"
            self.assertEqual(content, expected_path, f"Pointer content mismatch for {stage}")

    def test_creates_audit_entry(self):
        """Test that audit trail is created (Article X, Section 7)."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        self.assertIn('audit_file', result)
        audit_path = Path(result['audit_file'])
        self.assertTrue(audit_path.exists(), "Audit entry not created")

        content = audit_path.read_text()
        self.assertIn(f"# Bootstrap Audit: {self.test_project} / {self.test_session}", content)
        self.assertIn(f"**Owner:** {self.test_owner}", content)
        self.assertIn(f"**Session ID:** {self.test_session}", content)
        self.assertIn("Article X, Section 2", content)

        # Verify all canonical paths listed
        for stage in SessionManager.STAGES:
            expected_path = f"{stage}/projects/{self.test_project}/sessions/{self.test_session}/"
            self.assertIn(expected_path, content, f"Canonical path {expected_path} not in audit")

    def test_requires_session_name(self):
        """Test that session_name is required (Article X, Section 2)."""
        with self.assertRaises(ValueError) as context:
            SessionManager.create_session(self.test_project, "", self.test_owner)

        self.assertIn("session_name is required", str(context.exception))

    def test_canonical_paths_returned(self):
        """Test that canonical_paths dictionary is returned."""
        result = SessionManager.create_session(
            self.test_project,
            self.test_session,
            self.test_owner
        )

        self.assertIn('canonical_paths', result)
        canonical_paths = result['canonical_paths']

        # Verify all stages in canonical_paths
        for stage in SessionManager.STAGES:
            self.assertIn(stage, canonical_paths)
            expected_path = f"projects/{self.test_project}/sessions/{self.test_session}/{stage}"
            self.assertEqual(canonical_paths[stage], expected_path)


class TestSessionBootstrapIntegration(unittest.TestCase):
    """Integration tests for full bootstrap workflow."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_project = "IntegrationTest"
        self.test_session = "integration-session"
        self.test_owner = "integration-owner"
        self.root = ROOT

    def tearDown(self):
        """Clean up test artifacts (same as TestSessionBootstrap)."""
        paths_to_clean = [
            self.root / "projects" / self.test_project,
            self.root / "intents" / "projects" / self.test_project,
            self.root / "contexts" / "projects" / self.test_project,
            self.root / "specs" / "projects" / self.test_project,
            self.root / "plans" / "projects" / self.test_project,
            self.root / "tasks" / "projects" / self.test_project,
            self.root / "implementation" / "projects" / self.test_project,
            self.root / "feedback" / "projects" / self.test_project,
        ]

        for path in paths_to_clean:
            if path.exists():
                shutil.rmtree(path)

        # Clean up current/ pointers
        for stage in SessionManager.STAGES:
            current_dir = self.root / stage / "current"
            if current_dir.exists():
                if stage == 'feedback':
                    filename = 'feedback.md'
                elif stage == 'implementation':
                    filename = 'README.md'
                else:
                    filename = f"{stage.rstrip('s')}.md"

                pointer_file = current_dir / filename
                if pointer_file.exists():
                    try:
                        content = pointer_file.read_text()
                        if self.test_project in content:
                            pointer_file.unlink()
                    except Exception:
                        pass

        # Clean up audit entries
        audit_dir = self.root / "idse-governance" / "feedback"
        if audit_dir.exists():
            for audit_file in audit_dir.glob(f"bootstrap_{self.test_project}_*.md"):
                audit_file.unlink()

    def test_multiple_sessions_same_project(self):
        """Test creating multiple sessions for the same project."""
        # Create first session
        result1 = SessionManager.create_session(
            self.test_project,
            "session-1",
            self.test_owner
        )

        # Create second session
        result2 = SessionManager.create_session(
            self.test_project,
            "session-2",
            self.test_owner
        )

        # Both sessions should exist
        session1_path = self.root / "specs" / "projects" / self.test_project / "sessions" / "session-1"
        session2_path = self.root / "specs" / "projects" / self.test_project / "sessions" / "session-2"

        self.assertTrue(session1_path.exists())
        self.assertTrue(session2_path.exists())

        # CURRENT_SESSION pointer should point to latest session
        pointer = self.root / "projects" / self.test_project / "CURRENT_SESSION"
        content = pointer.read_text()
        self.assertIn("session_id: session-2", content)

        # current/ pointers should point to session-2
        intent_pointer = self.root / "intents" / "current" / "intent.md"
        pointer_content = intent_pointer.read_text()
        self.assertIn("session-2", pointer_content)

        # Clean up both sessions
        for session in ["session-1", "session-2"]:
            for stage in SessionManager.STAGES:
                path = self.root / stage / "projects" / self.test_project / "sessions" / session
                if path.exists():
                    shutil.rmtree(path)


if __name__ == "__main__":
    unittest.main()
