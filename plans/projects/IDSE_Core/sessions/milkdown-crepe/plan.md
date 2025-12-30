# Implementation Plan

Plan: milkdown-crepe (file-first, Fastify)

Current status
- Phase 0 (Foundations) completed 2025-12-30: Fastify scaffold created at backend/services/milkdown-crepe with initial routes, validators, sanitizer, docs, and smoke tests.
- Phase 1 (Security & contract hardening) completed 2025-12-30: env validation, JWT auth, path guard, rate limit + CORS/body limit, response schemas, error handler/logging, contract/integration/middleware tests (49 passing).
- Phase 2–4 deliverables covered by the Phase 1 hardening effort (PUT/write refinement, ACL wiring to file-based provider, expanded coverage, docs refreshed).
- Active stage: Implementation wrap-up / handoff. Architecture: File-first, local-first. WRITE_MODE=local only; WRITE_MODE=pr deferred.

Scope
- Backend API (GET/PUT/render), request/response validation (zod + fastify-type-provider-zod), auth + ACL middleware (pluggable role provider), sanitizer pipeline, tests, and documentation.
- External sync handles git/PR; backend writes to workspace in local mode. No git/GitHub operations in current scope.
- Future/roadmap only: WRITE_MODE=pr (if ever requested), Puck/PageData, DB-backed JSONB sync.

Validation gates (keep green)
- python3 idse-governance/validate-artifacts.py
- python3 idse-governance/check-compliance.py
- Spot-check links in README/context/spec/intent and ensure no placeholder markers appear in pipeline docs.

Phases and Deliverables

Phase 0 — Foundations (✅ completed)
- Deliverables:
  - Fastify + TypeScript scaffold, routes for GET/PUT/render, sanitizer pipeline, and initial tests/docs.
  - zod validators for request payloads and path patterns.
  - Session metadata files (.owner, changelog, README) created.
- Acceptance criteria: service starts locally; validators exercised in tests; WRITE_MODE env handled; Docker + docs in place.

Phase 1 — Security, Read & Render Hardening (✅ completed 2025-12-30)
- Deliverables:
  - Central config (`src/config.ts`) with validated env vars (PORT, WRITE_MODE, AUTH_SECRET, WORKSPACE_ROOT, MAX_BODY_SIZE, FRONTEND_URL).
  - Auth: JWT Bearer validation in middleware; request.user populated.
  - Path safety: traversal guard and IDSE path whitelist helper reused in GET/PUT.
  - Defensive server config: rate limiting, bodyLimit 5MB, and CORS origins (localhost:3000/5173 + FRONTEND_URL).
  - Response schemas via fastify-type-provider-zod; error handler with structured logging.
  - GET/PUT/render handlers updated with logging, try/catch, and schema-enforced responses.
- Acceptance criteria: security controls enabled; 200/400/401/403/404 handled with schemas; compliance scripts pass. Status: met (tests 49/49, governance validator PASS).

Phase 2 — Edit (Local Write Refinement) (✅ covered)
- Deliverables:
  - PUT local-mode writer hardened (permission checks, validated payloads, saved metadata).
  - Optional PR path deferred unless explicitly requested.
- Acceptance criteria: PUT saves to workspace in local mode; auth/ACL enforced; no git operations performed. Status: met via current GET/PUT handlers + tests.

Phase 3 — ACL, Auth, and Governance Integration (✅ covered)
- Deliverables:
  - ACL middleware (owner/collaborator/reader) with session-aware checks; pluggable role provider wired to real source.
  - Governance hooks remain for external PRs created by IDE/agency workflows (outside this service).
- Acceptance criteria: unauthorized access rejected; role provider integration validated. Status: met with FileRoleProvider default; integration + contract tests in place.

Phase 4 — Coverage, Hardening, and Docs (✅ covered)
- Deliverables:
  - Contract tests for GET/PUT/render (success + 400/401/403/404/500).
  - Integration tests for filesystem roundtrip; middleware tests for auth/ACL; sanitizer edge-case tests.
  - Docs refreshed (API, SECURITY, DEVELOPMENT, DEPLOYMENT/INTEGRATION as needed).
- Acceptance criteria: tests pass locally/CI; docs describe developer workflow and env vars; coverage meets targets. Status: met (docs refreshed, 49 tests passing, governance validator PASS).

Test Plan (session-focused)
- Unit tests:
  - zod validators, config parsing, sanitizer configuration, auth middleware happy/sad paths.
- Contract tests:
  - GET/PUT/render for positive paths and 400/401/403/404 responses, with schema validation.
- Integration/E2E:
  - Workspace roundtrip: PUT writes file → GET returns content → render returns sanitized HTML.
- Sample inputs:
  - Fixtures derived from session intent/spec/plan plus edge cases (inline HTML, tables, code blocks).

Risks & Mitigations
- Risk: Sanitizer configuration may over-strip required HTML or under-strip unsafe constructs. Mitigation: iterative tuning with sample inputs and contract tests.
- Risk: Misplaced artifacts (writing to wrong repo paths). Mitigation: strict path validation, traversal guard, and schema-enforced responses.
- Risk: Weak auth or logging gaps. Mitigation: JWT validation with secret, structured logs, and middleware unit tests.

Deferred decisions
- Whether to ever enable WRITE_MODE=pr (if yes, define scopes/labels/policy in a separate phase).
- Production CORS origin list (FRONTEND_URL) and rate-limit profile tuning.
- Compose/K8s topology with the existing Python service (document in DEPLOYMENT/INTEGRATION once decided).

Phase 5 — Frontend Milkdown Editor (current - 2025-12-30)

**Status**: Backend complete ✅ → Frontend implementation needed

**User Decisions**:
- Integration approach: Tabbed interface (Puck page builder | Pipeline Docs editor)
- Document selection: File browser/tree view sidebar
- Save behavior: Manual save button only (no auto-save)
- Preview mode: None (Crepe WYSIWYG sufficient)
- Role handling: Read-only editor for reader role

**Deliverables**:
- API client (milkdownApi.ts) with GET/PUT/render functions
- FileTree component for session directory structure
- MilkdownEditor component with Crepe integration
- useMilkdownDocument hook for document load/save
- SessionTabs component for tab switching
- PipelineDocsEditor wrapper (FileTree + MilkdownEditor)
- Component tests and API client tests

**Files to Create**:
- frontend/widget/src/services/milkdownApi.ts - API client
- frontend/widget/src/types/milkdown.ts - TypeScript types
- frontend/widget/src/components/FileTree.tsx - File tree sidebar
- frontend/widget/src/hooks/useSessionFiles.ts - Hook to list files
- frontend/widget/src/types/fileTree.ts - File tree types
- frontend/widget/src/components/MilkdownEditor.tsx - Main editor
- frontend/widget/src/hooks/useMilkdownDocument.ts - Document state hook
- frontend/widget/src/components/SessionTabs.tsx - Tab switcher
- frontend/widget/src/components/PipelineDocsEditor.tsx - Wrapper component

**Files to Modify**:
- frontend/widget/package.json - Add @milkdown/* dependencies
- frontend/widget/src/components/SessionPage.tsx (or equivalent) - Add tabs
- frontend/widget/.env - Add VITE_MILKDOWN_API_URL

**Layout**:
```
┌─────────────────────────────────────────┐
│  Sidebar (25%)  │  Editor (75%)         │
│  FileTree       │  MilkdownEditor       │
│  - intents/     │  ┌─────────────────┐ │
│    - intent.md  │  │ Save    [Dirty] │ │
│  - specs/       │  │  # Intent       │ │
│    - spec.md    │  │  ...            │ │
│  - plans/       │  └─────────────────┘ │
└─────────────────────────────────────────┘
```

**Acceptance Criteria**:
- Milkdown Crepe integrated and rendering WYSIWYG markdown
- Documents load from backend GET endpoint
- Manual save button writes via PUT endpoint
- Dirty state tracking (unsaved changes indicator)
- Read-only mode for reader role
- File tree shows session .md files
- Tab switching between Puck and Pipeline Docs works
- Error handling for 403/404/500
- Component properly cleans up (crepe.destroy())
- Tests cover main flows

Next steps
- **Immediate**: Codex implements Phase 5 frontend (see tasks.md T5.1-T5.6)
- Ops: confirm production env vars (AUTH_SECRET, WORKSPACE_ROOT, ROLE_PROVIDER=file, CORS origins, rate limits) and deploy in local-write mode.
- Optional: if a non-file role source is requested, define it and implement a new RoleProvider subclass with tests.
- Optional future: PR mode remains deferred; treat as separate scoped phase if ever requested.
