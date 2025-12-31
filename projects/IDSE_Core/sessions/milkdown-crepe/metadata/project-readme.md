# Milkdown-Crepe Backend Integration

## Purpose

Backend API to support Milkdown-based Markdown editor for server-side document management and rendering of session-scoped IDSE pipeline documents (intent, context, spec, plan, tasks).

## Current Stage

**Phase 0 Foundations ✅ complete → Phase 1 security/test hardening in progress**

```
Pipeline: Intent ✅ → Context ✅ → Spec ✅ → Plan ✅ → Tasks ✅ → Implementation ✅ (Phase 0) → Implementation 🔄 (Phase 1) → Feedback ⏳
```

## Architecture Decision

**File-first, local-first persistence** with optional PR workflow.

- **Default mode**: `WRITE_MODE=local` — backend writes directly to workspace files, no git/PR operations
- **External sync**: IDE/agency workflows handle git sync and PR creation
- **Governance**: `validate-artifacts` and `check-compliance` run on PRs created by external sync (not by this service)

Backend exposes:
- `GET /api/sessions/:project/:session/documents` - Read session documents
- `PUT /api/sessions/:project/:session/documents` - Write to workspace (local mode) or create PR (optional pr mode)
- `POST /api/sessions/:project/:session/render` - Server-side Markdown → sanitized HTML rendering

## Key Artifacts

- **Intent**: [intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md](../../../intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md)
- **Context**: [contexts/projects/IDSE_Core/sessions/milkdown-crepe/context.md](../../../contexts/projects/IDSE_Core/sessions/milkdown-crepe/context.md)
- **Spec**: [specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md](../../../specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md)
- **Plan**: [plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md](../../../plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md)
- **Tasks**: [tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md](../../../tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md)

## Implementation Status

- [x] **Phase 0**: Foundations (scaffold, validators, CI config)
- [ ] **Phase 1**: Security + Read/Render hardening (auth, path safety, rate limit/CORS/body limits, response schemas, error handler/logging)
- [ ] **Phase 2**: Edit/PR Flow (PUT with local writes; optional PR path)
- [ ] **Phase 3**: ACL & Governance Integration
- [ ] **Phase 4**: Tests, Hardening, Docs

## Technology Stack

**Frontend**:
- React 18.3.1 + TypeScript 5.6.3 + Vite 7.3.0
- **@milkdown/crepe** package (pre-built Milkdown editor with themes & UI)
- Integration pattern: React component (useRef + useLayoutEffect lifecycle)

**Backend** (Node.js microservice):
- Runtime: Node.js LTS (alongside existing Python/FastAPI backend)
- Framework: **Fastify** (chosen 2025-12-30) with fastify-type-provider-zod
- Rendering: unified/remark → rehype → rehype-sanitize
- Validation: zod for request/response schemas
- Testing: Vitest + supertest/fastify inject for API contracts

**Integration**:
- Auth: Bearer token via existing IDSE auth middleware
- ACL: Owner/Collaborator/Reader roles enforced per-session
- Optional GitHub API: Octokit (only if WRITE_MODE=pr enabled later)

## Resolved Decisions

All architectural questions resolved as of 2025-12-29:

1. **Backend runtime**: Node.js LTS microservice
2. **Storage**: File-first (workspace repository, no automatic git/PR)
3. **Auth**: Bearer token (existing IDSE auth middleware)
4. **ACL model**: Owner/Collaborator/Reader per-session
5. **Rendering parity**: Semantic equivalence (not exact HTML match)
6. **Sample docs**: Use this session's own intent.md, spec.md, plan.md for tests
7. **CI placement**: GitHub Actions on external PRs (not triggered by editor service)
8. **Write mode**: Default WRITE_MODE=local (workspace only)

## Phase 0 Completion Checklist (done)

- [x] Intent.md resolved all open questions → "Resolved decisions (2025-12-29)"
- [x] Context.md completed with actual environment/stack/constraints/risks
- [x] Spec.md updated to "File-first, local-first; optional PR flow"
- [x] Plan.md/Tasks.md updated for WRITE_MODE=local approach
- [x] README.md replaced with session overview (this file)
- [x] `.owner` file created
- [x] `changelog.md` created with Fastify decision
- [x] Service scaffold created at `backend/services/milkdown-crepe/` with initial routes, sanitizer, tests, Dockerfile

## Next Actions (Phase 1)

1. Add config/env validation, JWT auth, path traversal guard, rate limiting, CORS, and 5MB body limit.
2. Enforce response schemas and add structured error handler + logging.
3. Expand tests: contract (GET/PUT/render), middleware (auth/ACL), filesystem roundtrip, sanitizer edge cases.
4. Re-run governance validation: `python3 idse-governance/validate-artifacts.py` and `python3 idse-governance/check-compliance.py`.

## Session Ownership

- **Requester**: tjpilant
- **Owner**: interactive-user
- **Session**: milkdown-crepe
- **Created**: 2025-12-29
- **Status**: planning-complete → ready-for-implementation
