# Session Integration (Phase 1)

This repository now understands Agency-managed sessions while keeping simple path fallbacks for non-session projects.

## Session Metadata
- Written by the Agency in the project root: `.idse_active_session.json`
- Example:
  ```json
  {
    "session_id": "cli-1766328748",
    "name": "feature-auth",
    "created_at": 1766328748.0,
    "owner": "tjpilant",
    "project": "MyApp"
  }
  ```
- The companion reads this file only; session creation and switching stay in the Agency.

## Path Resolution Order
For each stage (`intents`, `contexts`, `specs`, `plans`, `tasks`) and filename (`intent.md`, etc.):
1) Session path: `{stage}/projects/{project}/sessions/{session_id}/{filename}`
2) Current symlink: `{stage}/current/{filename}` (maintained by Agency)
3) Stage fallback: `{stage}/{filename}`
4) Flat file fallback: `{filename}`

Resolution is implemented in `utils/doc_reader.py` with session metadata from `session_reader.py`.

## Validation (session-aware)
- `integrations/claude-skill/scripts/validate_artifacts.py` now resolves artifacts via the order above.
- Keeps existing `[REQUIRES INPUT]` checks and readiness reporting.
- Prints active session info when available.

## Governance Task (visibility)
- `.cursor/tasks/governance.py` prints the active session and where artifacts were resolved from.
- Run with `python .cursor/tasks/governance.py` from the project root.

## Expected Layouts
Session-enabled projects (Agency-managed):
- `.idse_active_session.json`
- `specs/projects/<project>/sessions/<session_id>/spec.md`
- `specs/current/ -> specs/projects/<project>/sessions/<session_id>/` (symlink)

Simple/legacy projects:
- `spec.md`, `plan.md`, etc. in the root or in `<stage>/` directories.

## Backward Compatibility
- If no session file is present, the companion uses the simple path fallbacks.
- No session creation is performed from the companion.
