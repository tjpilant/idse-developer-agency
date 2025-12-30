# Changelog

## 2025-12-28
- Added GitHub App authentication support across backend and tools (optional Authorization header tokens, App ID/key/installation envs); removed reliance on stored PATs where not needed.
- Implemented branch auto-creation fallback when committing so missing target branches are created from the default branch instead of failing with 404.
- Updated env templates and docs to reflect GitHub App setup, add key path, and mark PAT as optional; added GitHub App setup guide.
- Hardened status endpoint for app tokens (skips `/user` call) and improved tests/tooling to accept one-time tokens via headers.
- Added companion bundle tooling support for header-based tokens and auth mode overrides.
- Synced companion bundle governance tasks: added full governance validator, PYTHONPATH fixes for governance.py, and ensured guardrails self-test runs cleanly in installed repos.
- Governance handoff task now bootstraps a default state.json on first run to avoid failures in fresh installs.
- Added active-LLM enforcement: governance.py now has `check-active` (env-aware, staleness warning) and wrapper `run_with_active_check.sh` to gate tasks by `LLM_ID`; view shows env/staleness hints.
