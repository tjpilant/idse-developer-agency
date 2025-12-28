"""
Build and optionally commit the IDE Companion tree into a target repo/branch.

- Reimplements the companion bundle builder (no external script call).
- Copies the defined companion files/dirs from the companion source repo.
- Stages them under the specified install prefix in the target repo and commits via the Agency git API.
"""

import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional, List

import requests
from pydantic import Field
from agency_swarm.tools import BaseTool

from SessionManager import SessionManager

# Default companion source bundled in this repository
BUNDLED_COMPANION_PATH = Path(__file__).resolve().parents[2] / "companion_bundle"

# Paths taken from idse-developer-agent/scripts/build_companion_bundle.py
COMPANION_INCLUDE_PATHS = [
    "AGENTS.md",
    "CLAUDE.md",
    "session_reader.py",
    "utils/doc_reader.py",
    "utils/sync_detector.py",
    "utils/template_writer.py",
    "utils/feedback_writer.py",
    "guardrails/",
    "integrations/claude-skill/scripts/validate_artifacts.py",
    ".cursor/rules/",
    ".cursor/tasks/governance.py",
    ".cursor/config/idse-governance.json",
    ".vscode/tasks.json",
    ".github/workflows/agency-dispatch-validate.yml",
    ".github/workflows/guardrails-checks.yml",
    ".github/workflows/validate-and-notify.yml",
    "scripts/pre_commit_check.py",
    "docs/session-integration.md",
    "docs/hybrid-mode.md",
    "docs/feedback-loop.md",
    "docs/sync-protocol.md",
]


class BuildCompanionBundleTool(BaseTool):
    """
    Build the IDE Companion tree and (optionally) commit it to a target branch.

    Explicit branch selection is required for commits to avoid writing to default
    branches by accident. If you omit `branch`, the tool only builds and reports
    the staging path.
    """

    name: str = "BuildCompanionBundleTool"
    description: str = (
        "Build the IDE Companion tree from the companion source repo and optionally "
        "commit it into the target repository under a specified prefix/branch."
    )

    companion_repo: Path = Field(
        default=BUNDLED_COMPANION_PATH,
        description="Path to the companion sources to bundle (default: repo-local companion_bundle/)",
    )
    install_prefix: str = Field(
        default="companion_bundle",
        description="Destination prefix inside the target repo ('' for root, '.idse' to install under .idse)",
    )
    branch: Optional[str] = Field(
        default=None,
        description="Target branch to commit to. If omitted, the tool only builds and does not commit.",
    )
    commit_message: Optional[str] = Field(
        default="chore: add IDE Companion bundle",
        description="Commit message to use when committing the bundle",
    )
    trigger_dispatch: bool = Field(
        default=True,
        description="Trigger repository_dispatch after commit",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID to include in commit metadata (defaults to active session)",
    )
    project: Optional[str] = Field(
        default=None,
        description="Project to include in commit metadata (defaults to active session project)",
    )
    owner: Optional[str] = Field(
        default=None,
        description="Optional GitHub owner override for commit (defaults to backend env)",
    )
    repo: Optional[str] = Field(
        default=None,
        description="Optional GitHub repo name override for commit (defaults to backend env)",
    )
    auth_token: Optional[str] = Field(
        default=None,
        description="One-time GitHub token (PAT or installation token). The tool does not store or echo this value.",
    )
    auth_mode: Optional[str] = Field(
        default=None,
        description="Override auth mode ('pat' or 'app'). Defaults to backend env configuration.",
    )

    def _stage_bundle(self) -> (str, Path, List[dict]):
        repo = Path(self.companion_repo).resolve()
        if not repo.exists():
            return f"❌ Companion repo not found: {repo}", repo, []

        staging_dir = Path(tempfile.mkdtemp(prefix="companion_bundle_"))
        added = []
        for rel in COMPANION_INCLUDE_PATHS:
            src = repo / rel
            dest = staging_dir / rel
            if not src.exists():
                # Skip missing paths, but note them
                added.append(f"Skipping missing path: {rel}")
                continue
            if src.is_dir():
                shutil.copytree(src, dest, dirs_exist_ok=True)
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dest)
            added.append(f"Added: {rel}")

        files = self._collect_files(staging_dir)
        summary = "\n".join(added) + f"\n\nStaged companion bundle at: {staging_dir}"
        return summary, staging_dir, files

    def _collect_files(self, bundle_dir: Path) -> List[dict]:
        files = []
        for path in bundle_dir.rglob("*"):
            if path.is_file():
                rel = path.relative_to(bundle_dir)
                # Avoid double slashes when install_prefix is empty
                prefix = self.install_prefix.strip("/")
                target_path = f"{prefix}/{rel.as_posix()}" if prefix else rel.as_posix()
                content = path.read_text(encoding="utf-8")
                files.append({"path": target_path, "content": content})
        return files

    def _get_session_meta(self):
        try:
            meta = SessionManager.get_active_session()
            return meta.session_id, meta.project
        except Exception:
            return None, None

    def _commit_via_api(self, files: List[dict]) -> str:
        api_url = os.getenv("AGENCY_API_URL", "http://localhost:8000")
        session_id = self.session_id
        project = self.project

        if not session_id or not project:
            fallback_session, fallback_project = self._get_session_meta()
            session_id = session_id or fallback_session
            project = project or fallback_project

        if not session_id or not project:
            return "❌ Cannot commit: session_id/project not provided and no active session found."

        if not self.branch:
            return "ℹ️ Build completed. Skipping commit because no branch was provided."

        payload = {
            "session_id": session_id,
            "project": project,
            "files": files,
            "message": self.commit_message,
            "branch": self.branch,
            "trigger_dispatch": self.trigger_dispatch,
            "auth_mode": self.auth_mode,
        }

        if self.owner and self.repo:
            payload["owner"] = self.owner
            payload["repo"] = self.repo

        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"

        try:
            resp = requests.post(
                f"{api_url}/api/git/commit",
                json=payload,
                headers=headers,
                timeout=60
            )
        except requests.exceptions.ConnectionError:
            return "❌ Cannot reach Agency backend at AGENCY_API_URL."

        if resp.status_code != 200:
            detail = resp.json().get("detail", resp.text)
            return f"❌ Commit failed: {detail}"

        data = resp.json()
        if not data.get("success"):
            return f"❌ Commit error: {data.get('error', 'unknown error')}"

        commit_sha = data.get("commit_sha", "")[:7]
        branch = data.get("branch", self.branch)
        url = data.get("commit_url", "")

        msg = f"✅ Committed {len(files)} file(s) to {branch}\n   Commit: {commit_sha}\n   URL: {url}"
        dispatch = data.get("dispatch")
        if self.trigger_dispatch and dispatch:
            if dispatch.get("success"):
                msg += f"\n   ✓ Triggered repository_dispatch ({dispatch.get('event_type')})"
            else:
                msg += f"\n   ⚠️ Dispatch failed: {dispatch.get('error')}"
        return msg

    def run(self) -> str:
        summary, staging_dir, files = self._stage_bundle()
        if summary.startswith("❌"):
            return summary

        if not files:
            return f"{summary}\n\n❌ No files collected from staged bundle."

        if not self.branch:
            return f"{summary}\n\nℹ️ Build only. No branch provided, so no commit was attempted."

        commit_msg = self._commit_via_api(files)
        return f"{summary}\n\n{commit_msg}"
