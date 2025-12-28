# Work Notes (2025-12-28)

Summary of recent changes and rationale:

- GitHub App authentication: Backend now supports App tokens (Auth.AppAuth fallback to GithubIntegration) and per-request Authorization headers, reducing PAT exposure. Env files switched to App-first with key path and installation ID placeholders.
- Branch creation resilience: Commits now auto-create the target branch from the default branch if it does not exist, preventing 404s during companion bundle commits.
- Tooling updates: CommitArtifactsTool and BuildCompanionBundleTool accept header-based one-time tokens and auth mode overrides; routes accept Authorization headers for tokens.
- Status handling: `/api/git/status` handles app tokens without `/user` calls and still reports repo/default_branch/write access.
- Documentation: Added GitHub App setup guide and updated github-integration notes to describe App vs PAT flows and required scopes; env examples reflect App mode.
- Testing: Smoke test accepts Authorization header tokens to validate auth without storing PATs.

Open follow-ups:
- Consider a small helper script to mint installation tokens for manual testing (optional; backend already mints tokens).
- Remove staged companion bundle temp dirs if no longer needed.
