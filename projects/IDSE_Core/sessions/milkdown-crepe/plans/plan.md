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

Phase 5 — Frontend Milkdown Editor (✅ completed 2025-12-31)

**Status**: Backend complete ✅ → Frontend complete ✅

**Final Implementation (User Redirected from Original Plan)**:
- Integration approach: **Modal/overlay editor** (NOT tabbed interface - user wanted Milkdown example style)
- Document selection: **File open/save dialogs with short path format** (NOT sidebar file tree)
- Save behavior: Manual save button only (no auto-save) ✅
- Preview mode: None (Crepe WYSIWYG sufficient) ✅
- Role handling: Read-only editor for reader role ✅

**What Was Actually Built**:

✅ **API Client & Types**:
- frontend/widget/src/services/milkdownApi.ts - GET/PUT/render/listFiles functions
- frontend/widget/src/types/milkdown.ts - DocumentResponse, SaveResponse, RenderResponse types
- Authentication via JWT Bearer token from VITE_MILKDOWN_AUTH_TOKEN

✅ **Modal Overlay Editor**:
- frontend/widget/src/components/MarkdownEditorModal.tsx - Full-screen modal overlay
- Integrated into frontend/widget/src/components/WorkspacePage.tsx
- Fixed inset-4 overlay matching Milkdown examples (https://github.com/Milkdown/examples/tree/main/editor-crepe)
- Backdrop click to close with unsaved changes confirmation

✅ **File Open/Save Dialogs**:
- FileOpenDialog with short path input ("plans/plan.md")
- buildFullPath() auto-converts to full repository paths ("plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md")
- Quick-pick buttons for common IDSE documents (intents, specs, plans, tasks, contexts)
- FileSaveAsDialog for creating new documents
- Removed browser file picker (security prevents full path access)

✅ **Crepe Editor Integration**:
- Proper useLayoutEffect lifecycle management
- CRITICAL FIX: Removed `content` from dependency array to prevent infinite recreation
- Manual save button with dirty state indicator
- Read-only mode for reader role
- Error handling (401 Unauthorized, 404 Not Found, 500 Server Error)
- Cleanup on unmount (crepe.destroy())
- Unsaved changes confirmation

✅ **Authentication & Bug Fixes**:
- Fixed token env var: VITE_MILKDOWN_TOKEN → VITE_MILKDOWN_AUTH_TOKEN
- Fixed modal click events (backdrop vs content detection)
- Fixed editor editability (dependency array issue)
- Fixed path building for IDSE repository structure
- Fixed TypeScript types in withAuth()

**Files Created**:
- frontend/widget/src/components/MarkdownEditorModal.tsx (393 lines)
- frontend/widget/src/types/milkdown.ts

**Files Modified**:
- frontend/widget/src/components/WorkspacePage.tsx (token fix, modal integration)
- frontend/widget/src/services/milkdownApi.ts (auth header types)
- frontend/widget/.env (VITE_MILKDOWN_AUTH_TOKEN added)

**Not Implemented** (Different approach chosen):
- ❌ FileTree sidebar - User wanted modal overlay instead
- ❌ Tabbed interface - User wanted overlay like Milkdown examples
- ❌ useMilkdownDocument hook - Logic integrated directly into modal
- ❌ SessionTabs component - Not needed for overlay approach
- ❌ PipelineDocsEditor wrapper - Not needed
- ❌ Component tests - Deferred for future work

**Acceptance Criteria - Status**:
- ✅ Milkdown Crepe integrated and rendering WYSIWYG markdown
- ✅ Documents load from backend GET endpoint
- ✅ Manual save button writes via PUT endpoint
- ✅ Dirty state tracking (unsaved changes indicator)
- ✅ Read-only mode for reader role
- ✅ Error handling for 401/403/404/500
- ✅ Component properly cleans up (crepe.destroy())
- ⚠️ Tests - Manual E2E testing passed, automated tests deferred

**Technical Details**:

Modal Layout:
```
┌──────────────────────────────────────────────┐
│ Fixed Backdrop (z-40, black/50)             │
│  ┌────────────────────────────────────────┐ │
│  │ Modal (z-50, inset-4, white)           │ │
│  │ ┌────────────────────────────────────┐ │ │
│  │ │ Header: path | Open | SaveAs | Save│ │ │
│  │ ├────────────────────────────────────┤ │ │
│  │ │ Crepe Editor (WYSIWYG)             │ │ │
│  │ │ # Intent                           │ │ │
│  │ │ ...content...                      │ │ │
│  │ └────────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

File Open Dialog:
```
┌──────────────────────────────────────┐
│ Open Document                        │
│ ┌──────────────────────────────────┐ │
│ │ Tip: Use short format like       │ │
│ │ "plans/plan.md"                  │ │
│ │ Full path: plans/projects/...    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Input: [plans/plan.md____________]  │
│                                      │
│ Quick Open:                          │
│ [intents/intent.md               ]  │
│ [specs/spec.md                   ]  │
│ [plans/plan.md                   ]  │
│ [tasks/tasks.md                  ]  │
│ [contexts/context.md             ]  │
│                                      │
│ [Open]  [Cancel]                     │
└──────────────────────────────────────┘
```

Phase 6 — Unified Admin Dashboard (✅ Phase 0-1 completed 2025-12-31)

**Status**: Planning complete ✅ → Shell & Layout complete ✅

**Objective**: Refactor disconnected admin routes into a unified `/admin` dashboard with persistent 3-column layout (left nav | center canvas | right chat).

**Problem Statement**:
- Puck Editor opens in separate shell (`/editor`)
- MD Editor opens in workspace with broken menu (`/workspace`)
- Status Browser may be redundant (governance scripts handle validation)
- No unified control center - user navigates between disconnected routes

**Solution Architecture**:
- **Single `/admin` route** - all admin functionality in one place
- **Persistent 3-column layout**:
  - Left sidebar (~240px): Navigation menu with 2 collapsible sections
  - Center canvas (flexible): Dynamic workspace (Welcome | Puck | MD Editor)
  - Right sidebar (~590px): Persistent chat panel, always visible
- **No external navigation**: Everything happens inside dashboard canvas
- **Welcome screen**: Default view when no workspace active

**Implementation Plan Summary**:
- Phase 0: shadcn/ui setup (11 components installed) ✅
- Phase 1: Dashboard shell & layout (4 new components) ✅
- Phase 2: Puck Editor workspace integration (pending)
- Phase 3: MD Editor workspace integration (pending)
- Phase 4: Persistent chat session awareness (pending)
- Phase 5: Remove Status Browser (pending)
- Phase 6: Route cleanup and redirects (pending)

**Phase 0 - shadcn/ui Setup** ✅:
- Configured TypeScript path aliases (`@/*` → `./src/*`)
- Configured Vite alias resolution with path module
- Ran `npx shadcn@latest init --yes --defaults`
- Installed components: sidebar, button, card, collapsible, separator, scroll-area
- Installed dependencies: sheet, tooltip, input, skeleton, use-mobile hook
- Total: 11 shadcn/ui components ready for use

**Phase 1 - Dashboard Shell & Layout** ✅:

Files Created:
1. **frontend/widget/src/components/WelcomeView.tsx**
   - Default centered welcome message using shadcn Card
   - Displays when no workspace selected
   - Describes Puck Editor and MD Editor capabilities

2. **frontend/widget/src/components/LeftNav.tsx**
   - Dark slate navigation sidebar (240px fixed width)
   - Two collapsible sections using shadcn Collapsible:
     - **Puck Editor**: Blocks, Fields, Outline, Published Pages
     - **MD Editor**: Open Document, Intent, Spec, Plan, Tasks, Context
   - Active state highlighting with bg-slate-800
   - User profile section at bottom (Developer / admin@idse.dev)

3. **frontend/widget/src/components/DashboardLayout.tsx**
   - 3-column CSS Grid: `grid-cols-[240px_1fr_590px]`
   - Left column: Navigation sidebar with border-r
   - Center column: Dynamic canvas with bg-slate-50
   - Right column: Chat panel with border-l
   - Full viewport height with overflow handling per column

4. **frontend/widget/src/components/AdminDashboard.tsx**
   - Main dashboard container with state management
   - State interface: activeWorkspace, puckSubView, mdSubView, currentSession
   - handleWorkspaceChange() for menu navigation
   - renderCenterCanvas() switches between Welcome/Puck/MD views
   - Placeholder content for Puck and MD workspaces (Phase 2-3)

Files Modified:
- **frontend/widget/src/App.tsx**: Added `/admin` route → `<AdminDashboard />`
- **frontend/widget/tsconfig.json**: Added baseUrl and paths for `@/*` alias
- **frontend/widget/vite.config.ts**: Added path import and resolve.alias

**Dashboard State Interface**:
```typescript
interface DashboardState {
  activeWorkspace: "welcome" | "puck" | "md";
  puckSubView: "blocks" | "fields" | "outline" | "pages" | null;
  mdSubView: "open" | "intent" | "spec" | "plan" | "tasks" | "context" | null;
  currentSession: {
    project: string;
    session: string;
  };
}
```

**Layout Diagrams**:

Welcome State:
```
┌──────────────────────────────────────────────────────┐
│ LeftNav │    Welcome (centered card)     │  Chat   │
│  240px  │         (flexible width)        │ 590px   │
│         │                                 │         │
│ IDSE    │  ┌────────────────────────┐    │ Session │
│ Admin   │  │ IDSE Developer Agency  │    │ IDSE_   │
│         │  │ Welcome to unified...  │    │ Core/   │
│ Puck▾   │  │                        │    │ milkdo… │
│ MD      │  │ • Puck Editor          │    │         │
│         │  │ • MD Editor            │    │ [chat]  │
│ [User]  │  └────────────────────────┘    │         │
└──────────────────────────────────────────────────────┘
```

Puck/MD Placeholder State:
```
┌──────────────────────────────────────────────────────┐
│ LeftNav │    Workspace Placeholder       │  Chat   │
│  240px  │         (centered)              │ 590px   │
│         │                                 │         │
│ Puck▾   │      Puck Editor                │         │
│ Blocks* │      Active view: blocks        │         │
│ Fields  │      (Phase 2 pending)          │         │
│ Outline │                                 │         │
│ Pages   │                                 │         │
└──────────────────────────────────────────────────────┘
```

**Technical Decisions**:
- **Framework**: shadcn/ui + Tailwind CSS (not Pagedone - license concerns)
- **Layout**: CSS Grid (not flexbox) for precise column sizing
- **Navigation**: Collapsible sections (not tabs or accordion)
- **State Management**: React useState (no Redux/Zustand needed yet)
- **Routing**: Single `/admin` route (no sub-routes or URL params)

**Next Steps**:
- Phase 2: Extract Puck editor logic into PuckWorkspace component
- Phase 3: Extract MD editor logic into MDWorkspace component
- Phase 4: Make RightPanel session-aware with project/session header
- Phase 5: Remove StatusBrowserWidget and all status browser files
- Phase 6: Add route redirects (`/editor`, `/workspace` → `/admin`)

**References**:
- Plan file: `/home/tjpilant/.claude/plans/indexed-splashing-lamport.md`
- shadcn/ui docs: https://ui.shadcn.com/
- Components library: `frontend/widget/src/components/ui/`

---

Next steps
- Documentation: Update frontend README with modal editor usage guide
- Optional: Add automated component tests
- Optional: Clean up debug console.log statements
- Ops: Deploy with confirmed env vars (AUTH_SECRET, WORKSPACE_ROOT, ROLE_PROVIDER=file, CORS origins)
- Optional future: PR mode remains deferred; treat as separate scoped phase if ever requested.
