Development Guide — milkdown-crepe service

Prerequisites
- Node.js 20+ (LTS), npm or pnpm
- Recommended: run in the repository root to access IDSE governance scripts

Local setup
1. Copy env example:
   cp backend/services/milkdown-crepe/.env.example backend/services/milkdown-crepe/.env
   Set WRITE_MODE=local for development and provide AUTH_SECRET as needed. WORKSPACE_ROOT defaults to cwd if unset; FRONTEND_URL optional for CORS. ROLE_PROVIDER defaults to file (uses .owner/.collaborators).
2. Install dependencies:
   cd backend/services/milkdown-crepe
   npm install
   (If package.json changes, rerun npm install to sync node_modules—for example when rehype-raw was added.)
3. Run in dev mode:
   npm run dev
   The service listens on port defined in .env (default 8001).
   Health probes: /healthz and /readyz (no auth) for quick checks.
   PR mode is deferred/not implemented; the service performs local file writes only.

Testing
- Unit, contract, middleware, and integration tests use vitest:
   npm test
- Smoke and contract coverage: /render, GET/PUT documents, middleware auth, filesystem roundtrip.

Linting and formatting
- Project does not enforce a particular linter in scaffold; follow repository conventions. Add ESLint/Prettier if desired.

Running governance checks locally
- From repository root:
   python3 idse-governance/validate-artifacts.py
   python3 idse-governance/check-compliance.py
   python3 idse-governance/audit-feedback.py

Docker
- Build image:
   docker build -t milkdown-crepe -f backend/services/milkdown-crepe/Dockerfile .
- Run container:
   docker run -p 8001:8001 --env-file backend/services/milkdown-crepe/.env backend/services/milkdown-crepe

Notes for reviewers
- Key files to review:
  - spec: specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md
  - plan: plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md
  - validators: backend/services/milkdown-crepe/src/validators/schemas.ts
  - render pipeline: backend/services/milkdown-crepe/src/render/pipeline.ts
  - API docs: backend/services/milkdown-crepe/docs/API.md

Contribution workflow
- Branching: feature/<short-desc> or fix/<short-desc>
- PR: include link to task(s) in tasks.md and run governance checks in CI
