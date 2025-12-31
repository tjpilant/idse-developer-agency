# Specification

## Overview

 Spec: milkdown-crepe (File-first, local-first; PR mode deferred)

Decision summary
- Architecture: File-first persistence in the local workspace repository. Backend API exposes read, write (edit), and render endpoints. Default WRITE_MODE=local writes directly to workspace files with no git/PR side effects; external IDE/agency workflows handle syncing and PRs. Optional WRITE_MODE=pr is deferred and not implemented in current scope.
- Runtime: Node.js (recommended) to allow remark/rehype server rendering and reuse of Milkdown ecosystem.
- Framework: Fastify (chosen 2025-12-30) — selected for TypeScript ergonomics, performance, and seamless integration with zod via fastify-type-provider-zod. (If team strongly prefers Express, the spec documents how to adapt validators and middleware.)
- Path safety: allow only session-scoped IDSE markdown paths matching `^(intents|contexts|specs|plans|tasks)/.*\\.md$`, resolved against WORKSPACE_ROOT with traversal guard.
- Security baseline (Phase 1): JWT Bearer auth, rate limiting, bodyLimit=5MB, CORS whitelist (localhost:3000/5173 + FRONTEND_URL), structured error handler and logging.
- MVP goal: enable viewing and editing of IDSE pipeline documents (intent, context, spec, plan, tasks) with sanitized server-side rendering; governance via validate-artifacts/check-compliance runs when external PRs are created by IDE/agency sync.

## API contracts
1) GET /api/sessions/:project/:session/documents
- Query: path=<repo_path> (e.g., intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md)
- Auth: Authorization: Bearer <token>
- Response 200: { path, content: string, metadata: { owner, schema_version, updated_at } }
- 404: { error }

2) PUT /api/sessions/:project/:session/documents
- Body: { path, content }
- Auth: Authorization: Bearer <token>
- Validation: zod schema validates path (allowed prefixes), content non-empty.
- Behavior (WRITE_MODE=local): write file content to workspace path, return saved metadata. No git/PR operations.
- Response 200: { path, saved: true, mode: "local" }
- Errors: 400, 401, 403, 500

3) POST /api/sessions/:project/:session/render
- Body: { content?: string, path?: string }
- Behavior: If path provided, load file; else use content. Convert Markdown -> HTML using remark -> rehype; sanitize via rehype-sanitize/DOMPurify. Return sanitized HTML.
- Response 200: { html }

## Auth & ACL
- Auth: JWT Bearer tokens validated with shared `AUTH_SECRET`; request.user populated with identity/roles. Missing or invalid tokens return 401.
- ACL: Owner/Collaborator/Reader enforced per session (reader=GET/render, collaborator/owner=PUT). Role resolution supports a pluggable provider (default in-memory).

## Validation (zod examples)
- Request validator (simplified):
  const PutDocumentSchema = z.object({
    path: z.string().regex(/^intents\/|^contexts\/|^specs\//),
    content: z.string().min(1),
    commitMessage: z.string().optional(),
    branch: z.string().optional(),
  });

## Acceptance Criteria
- Unit tests: config parsing, file repository layer (local writes), API handlers, renderer pipeline, zod validators.
- Contract tests: GET/PUT/POST render response shapes and error cases (200/400/401/403/404).
- Middleware tests: auth (valid/expired/missing), ACL roles/provider.
- Integration/E2E: local mode—PUT saves to workspace, GET returns file, render returns sanitized HTML for sample inputs.
- Acceptance: can fetch, edit (local save), and render session-scoped artifacts; security controls (auth, traversal guard, rate limit, body limit, CORS) enabled. Governance runs when external PRs are created by IDE/agency sync.

## Operational notes
- Logging & metrics: track save attempts, PR creation, render latencies, sanitizer violations.
- Defensive server config: rate limiting per IP (100 req/min target), bodyLimit 5MB, CORS whitelist for localhost dev + FRONTEND_URL.
- Backups: rely on repo history; no DB backups required for file-first approach.

## Migration & future work (Puck/JSONB)
- If adopting Puck or structured PageData, consider hybrid approach: store canonical Markdown files in repo and store structured JSON (PageData) in a Postgres documents table (jsonb). Use schema_version and zod to validate PageData. Provide a background sync or export to keep repo and DB consistent.
- zod schemas should be authored for any PageData shapes to validate before persistence and to drive contract tests.

## Deferred questions
1) If WRITE_MODE=pr is ever enabled, define PR labeling/reviewer policy and required GitHub token scopes.
2) Production CORS origin list beyond localhost and FRONTEND_URL env var.
3) Compose/K8s topology with existing Python service (reverse proxy config).

## Next steps
- Finalize role provider integration (replace in-memory with real session role source).
- Confirm ops settings (CORS origins, rate limiting) for production.
- If WRITE_MODE=pr is ever enabled, treat as a separate future phase with its own design/tests.
