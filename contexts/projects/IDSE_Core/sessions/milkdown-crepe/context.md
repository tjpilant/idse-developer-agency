# Context

Intent reference: intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md -> # Intent: milkdown-crepe


Use this template to capture the environment, constraints, and risks that shape
architecture, plans, and tasks.

## 1. Environment

- **Product / Project:** IDSE Developer Agency – session-scoped pipeline documents
- **Domain:** Developer tooling / IDE-integrated document management
- **Users / Actors:** Session owners, collaborators, readers; CI systems running governance checks; agency/IDE sync processes

## Technical Environment

- **Runtime (recommended):** Node.js LTS for backend to allow remark/rehype server-side rendering and reuse of Milkdown ecosystem.
- **Write mode:** Default WRITE_MODE=local (workspace read/write only, no git/PR). External IDE/agency workflows handle git sync/PRs when needed.
- **CI/CD:** GitHub Actions (or org standard). Governance checks (validate-artifacts, check-compliance) run on PRs created by external sync flows; not triggered by local saves.
- **Repository layout:** Session-scoped artifacts live in intents/... contexts/... specs/... plans/... tasks/... under the project/session paths.
- **Hosting:** Local service alongside existing FastAPI backend; optionally containerized for deployment.

## 2. Stack

- **Frontend:** React 18 + TypeScript + Vite; integrates Milkdown Crepe component for editing session markdown.
- **Backend / API:** Node.js service for read/write/render; framework TBD (Express or Fastify). Existing Python/FastAPI backend remains unchanged.
- **Database / Storage:** File-first (workspace repository). No DB required for baseline; optional Postgres jsonb for future metadata.
- **Infrastructure:** Local dev + optional Docker; GitHub Actions for CI.
- **Integrations:** Governance scripts (validate-artifacts, check-compliance); optional GitHub API only if PR mode is enabled later.

## 3. Constraints

- **Scale:** Single-user IDE sessions; low concurrency; documents typically <1 MB.
- **Performance:** Target render <500ms for typical docs; writes should be near-instant for local file saves.
- **Compliance / Security:** Enforce ACLs; sanitize rendered HTML to prevent XSS; keep tokens local; PR-based governance only when sync occurs.
- **Team Capabilities:** Comfortable with Node/React/TypeScript; Milkdown integration is newer.
- **Deadlines:** Iterative delivery; no fixed date, but unblock editor integration early.
- **Legacy Considerations:** Preserve IDSE file structure; do not disrupt existing FastAPI routes or Puck/CopilotKit flows.

## 4. Risks & Unknowns

- **Technical Risks:** Milkdown Crepe React lifecycle issues; sanitizer tuning; framework choice (Express vs Fastify) still pending.
- **Operational Risks:** Mode confusion (local vs PR); need clear banners and config. Local writes must avoid stale data—provide reload flow.
- **Regulatory Risks:** Token handling if PR mode is later enabled.
- **Unknowns:** Final decision on enabling PR mode; port/topology for Node service; monitoring/health checks for deployment.
