from __future__ import annotations

import argparse
import subprocess
from pathlib import Path
from typing import List, Optional

from session_reader import SessionReader


class SyncDetector:
    """Detect Agency commits affecting the active session's artifacts."""

    def __init__(self, base_dir: Path | str = Path(".")):
        self.base_dir = Path(base_dir)

    def _session_paths(self, session: dict) -> List[Path]:
        project = session["project"]
        session_id = session["session_id"]
        stages = ["intents", "contexts", "specs", "plans", "tasks"]
        return [
            self.base_dir
            / stage
            / "projects"
            / project
            / "sessions"
            / session_id
            for stage in stages
        ]

    def _run_git(self, args: list[str]) -> str:
        result = subprocess.run(
            ["git", *args],
            cwd=self.base_dir,
            check=False,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()

    def detect_agency_updates(self) -> dict:
        session = SessionReader.get_active_session(base_dir=self.base_dir)
        if not session:
            return {"has_updates": False, "reason": "no_session"}

        paths = self._session_paths(session)
        cmd_args = [
            "log",
            "-1",
            "--format=%H|%an|%ar|%s",
            "--",
            *[str(p) for p in paths],
        ]
        output = self._run_git(cmd_args)
        if not output:
            return {"has_updates": False, "reason": "no_commits"}

        commit_hash, author, time_ago, message = output.split("|", maxsplit=3)
        return {
            "has_updates": True,
            "commit": commit_hash[:7],
            "author": author,
            "time_ago": time_ago,
            "message": message,
            "session": session,
        }

    def changed_artifacts(self, commit: str, session: dict) -> List[str]:
        paths = self._session_paths(session)
        cmd_args = [
            "show",
            "--name-only",
            "--pretty=",
            commit,
            "--",
            *[str(p) for p in paths],
        ]
        output = self._run_git(cmd_args)
        return [line for line in output.splitlines() if line.strip()]


def main():
    parser = argparse.ArgumentParser(
        description="Detect Agency updates for the active IDSE session."
    )
    parser.add_argument(
        "--show-changes",
        action="store_true",
        help="List files changed in the latest Agency commit.",
    )
    args = parser.parse_args()

    detector = SyncDetector()
    result = detector.detect_agency_updates()

    if not result.get("has_updates"):
        reason = result.get("reason", "none")
        print(f"✓ No Agency updates detected ({reason}).")
        return

    print("✓ Agency updates detected:")
    print(f"  Commit: {result['commit']} by {result['author']} ({result['time_ago']})")
    print(f"  Message: {result['message']}")

    if args.show_changes:
        changes = detector.changed_artifacts(result["commit"], result["session"])
        if changes:
            print("  Changed artifacts:")
            for path in changes:
                print(f"   - {path}")
        else:
            print("  Changed artifacts: none reported")


if __name__ == "__main__":
    main()
