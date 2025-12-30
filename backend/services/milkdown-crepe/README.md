Milkdown-Crepe service (backend) - minimal scaffold

This folder contains a starter scaffold for the milkdown-crepe Node.js microservice.

Run locally:
- cp .env.example .env
- npm install  (rerun after package.json changes to sync deps)
- npm run dev

Health:
- GET /healthz → { status: "ok" }
- GET /readyz → { status: "ready" }

Endpoints:
- GET /api/sessions/:project/:session/documents?path= (requires reader role)
- PUT /api/sessions/:project/:session/documents (requires collaborator role)
- POST /api/sessions/:project/:session/render (requires reader role)

Access Control (ACL):
- Three-tier role model: reader, collaborator, owner
- Default mode: File-based role provider (ROLE_PROVIDER=file)
- Session roles are read from `.owner` and `.collaborators` files in `projects/{project}/{session}/`
- Example structure:
  ```
  projects/IDSE_Core/milkdown-crepe/.owner          # Contains: "interactive-user"
  projects/IDSE_Core/milkdown-crepe/.collaborators  # Contains: "user1\nuser2" (optional)
  ```
- Role resolution: owner (from .owner file) > collaborator (from .collaborators) > reader (default)
- Missing `.owner` file will cause errors; all sessions must have an explicit owner

Environment Variables:
- ROLE_PROVIDER: 'file' (default) | 'memory' | 'static'
- ROLE_MAP: JSON map for static provider (e.g., `'{"user1:session1":"owner"}'`)
- WORKSPACE_ROOT: Root directory for file operations (defaults to cwd)
- WRITE_MODE: 'local' (default) | 'pr' (deferred/not implemented)

Notes:
- Uses Fastify + TypeScript + zod for validators.
- WRITE_MODE defaults to 'local' (writes to workspace files). PR mode is deferred/not implemented.
- Tests: `npm test` (50 tests including ACL, auth, sanitizer, and integration tests)
