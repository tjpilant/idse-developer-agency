# Tasks

Tasks: milkdown-crepe (atomic, no time estimates)

Default write mode
- WRITE_MODE=local (workspace read/write, no git/PR). PR flow is deferred and only enabled if explicitly requested.

Note: Tasks are ordered to support incremental delivery. Marked with [P] when parallelizable.

[x] Phase 0 — Backend Foundations (completed 2025-12-30)
- T0.1: Create service scaffold and configuration (Fastify + TS skeleton, env template, Dockerfile) — done
- T0.2: Implement zod validators and shared types — done
- T0.3: Add CI job placeholders for governance checks — done

[x] Phase 1-4 — Backend Security, ACL & Testing (completed 2025-12-30)
- All backend phases completed: JWT auth, file-based ACL, 49 tests passing
- Backend is production-ready for WRITE_MODE=local
- See changelog.md for full details

[x] Phase 5 — Frontend Milkdown Editor (completed 2025-12-31)

**Implementation Approach (User Decisions)**:
- Integration: Modal/overlay editor (like Milkdown examples) - NOT tabbed interface
- Document selection: File open/save dialogs with short path format
- Save: Manual save button only (no auto-save)
- Preview: No preview mode (Crepe WYSIWYG sufficient)
- Role handling: Read-only editor for readers

**What Was Built**:

[x] T5.1: Foundation & API Client
- Owner: claude-code
- Status: ✅ Completed
- Deliverables:
  - ✅ API client created: frontend/widget/src/services/milkdownApi.ts (GET/PUT/render/listFiles)
  - ✅ TypeScript types: frontend/widget/src/types/milkdown.ts (DocumentResponse, SaveResponse, RenderResponse)
  - ✅ Environment variable: VITE_MILKDOWN_API_URL=http://localhost:8001
  - ✅ Authentication token: VITE_MILKDOWN_AUTH_TOKEN (JWT)
  - ✅ Dependencies: @milkdown/crepe v7.5.4 already installed

[x] T5.2: Modal Overlay Editor Component
- Owner: claude-code
- Status: ✅ Completed (different approach than planned)
- Deliverables:
  - ✅ Modal component: frontend/widget/src/components/MarkdownEditorModal.tsx
  - ✅ Integrated into: frontend/widget/src/components/WorkspacePage.tsx
  - ✅ File open dialog with short path input and quick-pick buttons
  - ✅ File save-as dialog for creating new documents
  - ✅ Full overlay (fixed inset-4) like Milkdown examples
  - ✅ Backdrop click to close with unsaved changes confirmation
- Notes: User requested overlay/modal instead of sidebar file tree

[x] T5.3: Crepe Editor Integration
- Owner: claude-code
- Status: ✅ Completed
- Deliverables:
  - ✅ Crepe initialization with useLayoutEffect
  - ✅ Manual save button with dirty state tracking (isDirty indicator)
  - ✅ Read-only mode for reader role
  - ✅ Error handling (401, 404, 500 with user-friendly messages)
  - ✅ Proper cleanup (crepe.destroy() in useLayoutEffect return)
  - ✅ Unsaved changes confirmation on modal close
  - ✅ CRITICAL FIX: Removed `content` from useLayoutEffect deps to prevent recreation on keystroke

[x] T5.4: Path Building System
- Owner: claude-code
- Status: ✅ Completed
- Deliverables:
  - ✅ buildFullPath() function: converts "plans/plan.md" → "plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md"
  - ✅ Quick-pick buttons for common IDSE pipeline documents
  - ✅ Manual path input with live preview of full path
  - ✅ Removed browser file picker (security prevents full path access)

[x] T5.5: Authentication & Bug Fixes
- Owner: claude-code
- Status: ✅ Completed
- Issues Fixed:
  - ✅ Token environment variable: VITE_MILKDOWN_TOKEN → VITE_MILKDOWN_AUTH_TOKEN
  - ✅ Modal click events: Fixed backdrop vs content click detection
  - ✅ Editor editability: Removed `content` from useLayoutEffect dependency array
  - ✅ Path building: Auto-conversion from short to full repository paths
  - ✅ TypeScript types: Fixed withAuth return type in milkdownApi.ts

**Files Created**:
- frontend/widget/src/components/MarkdownEditorModal.tsx - Main modal component
- frontend/widget/src/types/milkdown.ts - TypeScript interfaces

**Files Modified**:
- frontend/widget/src/components/WorkspacePage.tsx - Token fix, modal integration
- frontend/widget/src/services/milkdownApi.ts - Auth header types
- frontend/widget/.env - Added VITE_MILKDOWN_AUTH_TOKEN

**Not Implemented** (Different approach taken):
- ❌ FileTree sidebar component - User wanted modal/overlay instead
- ❌ Tabbed interface - User wanted overlay like Milkdown examples
- ❌ Component tests - Deferred for future work
- ❌ Usage documentation - Pending

**Testing Status**:
- ✅ Manual E2E testing: Loading, editing, saving documents works
- ✅ Authentication: JWT token validation working
- ✅ Path building: Short paths correctly converted to full paths
- ✅ Editor editability: Typing works without focus loss
- ✅ Role handling: Read-only mode functional
- ⚠️ Automated tests: Deferred for future work

T5.6: Documentation (pending)
- Owner: interactive-user
- Update frontend README with Milkdown editor usage
- Document environment variables
- Add user guide for modal editor

Optional / Future Tasks (Roadmap)
- TF.1: Puck integration (PageData JSON import/export)
  - Owner: backend-dev
  - Reviewer: product
  - Draft zod schema for PageData
  - Design hybrid sync model (DB jsonb + repo commit)

- TF.2: Add optional Postgres metadata/index service
  - Owner: backend-dev
  - Reviewer: infra-dev
  - Implement document metadata indexing, search endpoints, and admin tools

Owners
- Default owner: interactive-user (changeable per task)
- Suggested role mappings (update with real team members):
  - frontend-dev: frontend engineer responsible for React integration
  - backend-dev: backend engineer responsible for Node/Fastify service
  - infra-dev: CI/infra engineer
  - security-eng: security engineer / sanitizer reviewer
  - qa-engineer: QA and contract test owner
