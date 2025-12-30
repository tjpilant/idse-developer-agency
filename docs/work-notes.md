# Work Notes (2025-12-28)

Summary of recent changes and rationale:

- GitHub App authentication: Backend now supports App tokens (Auth.AppAuth fallback to GithubIntegration) and per-request Authorization headers, reducing PAT exposure. Env files switched to App-first with key path and installation ID placeholders.
- Branch creation resilience: Commits now auto-create the target branch from the default branch if it does not exist, preventing 404s during companion bundle commits.
- Tooling updates: CommitArtifactsTool and BuildCompanionBundleTool accept header-based one-time tokens and auth mode overrides; routes accept Authorization headers for tokens.
- Status handling: `/api/git/status` handles app tokens without `/user` calls and still reports repo/default_branch/write access.
- Documentation: Added GitHub App setup guide and updated github-integration notes to describe App vs PAT flows and required scopes; env examples reflect App mode.
- Testing: Smoke test accepts Authorization header tokens to validate auth without storing PATs.
- Governance tasks: validate-idse-layer.sh now sets PYTHONPATH, runs guardrails self-test, session-aware validate-artifacts, and pre-commit checks. governance.py (root and bundle) prepends repo root to sys.path to avoid import errors when invoked via tasks; companion bundle now includes the updated validator.
- Handoff tasks: companion bundle governance.py replaced with the full handoff/state management script (handoff/acknowledge/role/stage/view) so installed repos can run the same CLI as the root task.
- State bootstrap: governance.py now creates a default state.json on first run to prevent missing-file errors in fresh installs.
- Active enforcement: governance.py adds `check-active` (env-aware, staleness warning); new wrapper `run_with_active_check.sh` loads `LLM_ID` from .env, verifies active LLM, and gates task execution.

Open follow-ups:
- Consider a small helper script to mint installation tokens for manual testing (optional; backend already mints tokens).
- Remove staged companion bundle temp dirs if no longer needed.
