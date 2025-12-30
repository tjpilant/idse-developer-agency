Security Notes — milkdown-crepe service

Sanitization
- Server-side rendering uses rehype-sanitize with a curated schema (see src/render/sanitize.ts). The schema allows common Markdown elements and limits attributes and protocols. Review and tune the schema as part of PRs that change rendering behavior.
- During review, run render contract tests with sample fixtures that include allowed HTML snippets (code blocks, links, emphasis, tables) to tune sanitizer.

Tokens & Secrets
- GITHUB_TOKEN (if PR mode enabled) must be stored in CI secrets only and not in source.
- AUTH_SECRET or other session tokens must be configured via environment variables and rotated per org policy.

ACL & Auth
- Middleware stubs exist in src/middleware. Replace with agency-auth integration that validates bearer tokens and enforces per-session ACLs. No git/PR operations are performed in current scope.

Logging & Audit
- Audit logs: record edits with session, user, path, and timestamp. Prefer structured logs (JSON) for automated ingestion.
- Avoid logging sensitive tokens or full document contents in production logs.

Network & Runtime
- Limit request body sizes for PUT to avoid large uploads; enforce timeouts.
- Run the service behind existing reverse-proxy or API gateway and use TLS in production.

Security review checklist (for PRs)
- Ensure sanitizer schema reviewed and tested with fixtures
- Confirm tokens are not leaked in logs or error messages
- Validate ACL checks on PUT endpoints
- Confirm required GitHub token scopes documented and minimal
- After dependency changes, rerun `npm install` and `npm test` to revalidate sanitizer and auth/ACL tests.
- Health endpoints (/healthz, /readyz) are unauthenticated by design; keep them minimal and free of sensitive data.

Files of interest:
- src/render/sanitize.ts (sanitizer schema)
- src/render/pipeline.ts (render pipeline)
- tests/render.test.ts (sanitizer/renderer unit tests)
