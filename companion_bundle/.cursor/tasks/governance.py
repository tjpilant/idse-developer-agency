from __future__ import annotations

from pathlib import Path
import sys

from session_reader import SessionReader
from utils.doc_reader import IDSEDocReader
from utils.sync_detector import SyncDetector


def show_session_info(base_dir: Path = Path(".")) -> None:
    """Print active session and resolved artifact paths."""
    session = SessionReader.get_active_session(base_dir=base_dir)
    reader = IDSEDocReader(base_dir=base_dir)

    print("\nIDSE Session Status")
    print("-" * 40)

    if not session:
        print("Session: none detected (.idse_active_session.json missing)")
    else:
        print(f"Session: {session.get('session_id')}")
        print(f"Project: {session.get('project')}")
        print(f"Owner: {session.get('owner')}")

    for stage_dir, filename in [
        ("intents", "intent.md"),
        ("contexts", "context.md"),
        ("specs", "spec.md"),
        ("plans", "plan.md"),
        ("tasks", "tasks.md"),
    ]:
        path = reader.resolve(stage_dir, filename)
        label = f"{stage_dir}/{filename}"
        if path:
            print(f"✓ {label}: {path}")
        else:
            print(f"• {label}: not found")


def show_sync_status(base_dir: Path = Path("."), show_changes: bool = False) -> None:
    """Print whether Agency has updated artifacts for the active session."""
    detector = SyncDetector(base_dir=base_dir)
    result = detector.detect_agency_updates()

    if not result.get("has_updates"):
        reason = result.get("reason", "none")
        print(f"\n✓ No Agency updates detected ({reason}).")
        return

    print("\nIDSE Agency Sync Status")
    print("-" * 40)
    print(f"Commit: {result['commit']} by {result['author']} ({result['time_ago']})")
    print(f"Message: {result['message']}")

    if show_changes:
        changes = detector.changed_artifacts(result["commit"], result["session"])
        if changes:
            print("Changed artifacts:")
            for path in changes:
                print(f" - {path}")
        else:
            print("No changed artifacts listed.")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "sync":
        show_sync_status(show_changes="--show-changes" in args)
    else:
        show_session_info()
