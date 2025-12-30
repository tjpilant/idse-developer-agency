Milkdown-Crepe Service — API Reference

Base URL: /api

Endpoints

Health
- GET /healthz → { status: "ok" } (no auth)
- GET /readyz → { status: "ready" } (no auth)

1) GET /api/sessions/:project/:session/documents?path=<repo_path>
- Description: Retrieve the content of a session-scoped document stored in the workspace.
- Query params: path (required) — repository/workspace relative path, e.g. intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md
- Auth: Authorization: Bearer <token>
- Responses:
  - 200: { path, content: string, metadata: { owner, schema_version?, updated_at } }
  - 401: { error: 'missing_auth' }
  - 404: { error: 'not found' }

2) PUT /api/sessions/:project/:session/documents
- Description: Save or update a session-scoped document in the workspace.
- Body (JSON): { path: string, content: string, commitMessage?: string, branch?: string }
- Auth: Authorization: Bearer <token> (requires edit permissions)
- Behavior:
  - WRITE_MODE=local (current behavior): writes directly to workspace file path and returns saved metadata.
  - WRITE_MODE=pr (deferred/future): not implemented in Phase 1; no git/PR/GitHub operations are performed.
- Responses:
  - 200: { path, saved: true, mode: 'local' }
  - 400: { error }
  - 401/403: { error }

3) POST /api/sessions/:project/:session/render
- Description: Render Markdown content (or file at path) to sanitized HTML on the server.
- Body (JSON): { content?: string, path?: string }
- Behavior: If path provided, server reads file content; otherwise uses provided content. Renders using unified/remark → rehype and sanitizes with rehype-sanitize.
- Responses:
  - 200: { html: string }
  - 400/500: { error }

Auth & ACL
- All endpoints require Authorization: Bearer <token> header (JWT tokens validated by auth middleware).
- Access control uses a three-tier role model:
  - reader: Can read documents and render markdown (GET, POST /render)
  - collaborator: Can read and write documents (GET, PUT, POST /render)
  - owner: Full access to all operations (GET, PUT, POST /render)

Role Provider Configuration:
- The service supports pluggable role providers via the ROLE_PROVIDER environment variable.
- Available modes:
  - file (default): Reads roles from `.owner` and `.collaborators` files in session directories
  - memory: In-memory provider (for testing)
  - static: Static role mapping via ROLE_MAP environment variable (JSON)

File-Based Role Provider (ROLE_PROVIDER=file):
- Session directory structure: `projects/{project}/{session}/`
- `.owner` file: Contains a single userId (owner of the session) — required
- `.collaborators` file: Newline-separated list of userIds (collaborators) — optional
- Role resolution logic:
  1. If userId matches `.owner` file → owner role
  2. If userId is in `.collaborators` file → collaborator role
  3. Otherwise → reader role (default)
- Missing `.owner` file will cause 500 errors
- SessionId format: `{project}:{session}` (e.g., "IDSE_Core:milkdown-crepe")

Example session structure:
```
projects/
  IDSE_Core/
    milkdown-crepe/
      .owner           # Contains: "interactive-user"
      .collaborators   # Contains: "user1\nuser2\nuser3"
      README.md
      changelog.md
```

Fallback Behavior:
- If role provider returns undefined, the system falls back to roles in JWT claims
- JWT format: `{ userId: string, roles: Role[] }`

Examples (curl)
- GET:
  curl -H "Authorization: Bearer $TOKEN" "http://localhost:8001/api/sessions/IDSE_Core/milkdown-crepe/documents?path=intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md"

- PUT:
  curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"path":"intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md","content":"# updated"}' http://localhost:8001/api/sessions/IDSE_Core/milkdown-crepe/documents

- Render:
  curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"content":"# hello"}' http://localhost:8001/api/sessions/IDSE_Core/milkdown-crepe/render

Notes
- This reference is intentionally minimal; use the spec (specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md) for formal contract definitions and test cases.
- After package.json changes, rerun `npm install` then `npm test` to validate contracts and sanitizer behavior.
- Health probes available at `/healthz` and `/readyz` (no auth required).
