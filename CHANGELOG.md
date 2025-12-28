# Changelog

## 2025-12-28
- Added GitHub App authentication support across backend and tools (optional Authorization header tokens, App ID/key/installation envs); removed reliance on stored PATs where not needed.
- Implemented branch auto-creation fallback when committing so missing target branches are created from the default branch instead of failing with 404.
- Updated env templates and docs to reflect GitHub App setup, add key path, and mark PAT as optional; added GitHub App setup guide.
- Hardened status endpoint for app tokens (skips `/user` call) and improved tests/tooling to accept one-time tokens via headers.
- Added companion bundle tooling support for header-based tokens and auth mode overrides.
