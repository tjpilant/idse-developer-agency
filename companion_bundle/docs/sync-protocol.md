# Sync Protocol (Agency → IDE)

This describes how the IDE Companion detects updates committed by the Agency.

## Detection Logic
- Active session comes from `.idse_active_session.json`.
- Artifact paths are session-scoped: `{stage}/projects/{project}/sessions/{session_id}/`.
- `utils/sync_detector.py` uses `git log -1 --format=%H|%an|%ar|%s -- <session paths>` to find the latest commit touching session artifacts.
- If found, it reports commit hash, author, time ago, and message.
- Optional: list changed artifacts via `git show --name-only <commit> -- <session paths>`.

## Usage
Command line:
```bash
python utils/sync_detector.py --show-changes
```

IDE task (VS Code):
- Task: **IDSE: Sync from Agency**
- Command: `git pull && python3 .cursor/tasks/governance.py sync --show-changes`

Cursor task:
```bash
python3 .cursor/tasks/governance.py sync --show-changes
```

## Repository Dispatch
- The Agency emits `repository_dispatch` with type `agency-update` after committing artifacts.
- Use `.github/workflows/agency-dispatch-validate.yml` to re-run validation on dispatch.

## Fallthrough Behavior
- If no session file exists, the sync detector reports `no_session`.
- If no commits touch session paths, it reports `no_commits`.
