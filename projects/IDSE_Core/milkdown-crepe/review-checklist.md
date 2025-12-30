Developer Review Checklist — milkdown-crepe

Purpose: Use this checklist when reviewing PRs or implementation artifacts for the milkdown-crepe session.

Pre-review
- [ ] Pull latest spec.md, plan.md, tasks.md, changelog.md
- [ ] Run validate-artifacts.py and check-compliance.py locally (or verify CI does)

API & Code
- [ ] API endpoints match spec (GET/PUT/render)
- [ ] zod validators present and cover path/content constraints
- [ ] Renderer pipeline documented and sanitized (rehype-sanitize schema reviewed)

Security
- [ ] Sanitize tests exist for allowed HTML snippets
- [ ] ACL enforcement present for write endpoints
- [ ] No secrets committed; env vars used

Tests & CI
- [ ] Unit tests for validators and renderer
- [ ] Contract tests for API response shapes
- [ ] CI workflow runs gov checks and tests

Docs
- [ ] API.md and DEVELOPMENT.md updated
- [ ] Changelog updated with framework/major decisions
- [ ] README references updated and links resolve

Notes for approvers
- If PR mode is introduced, ensure GitHub token scope and PR naming policy documented.
