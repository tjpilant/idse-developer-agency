# Changelog: milkdown-crepe

All notable changes to this session will be documented in this file.

## [Unreleased]

### Planning Phase (2025-12-29)

#### Added
- Initial IDSE pipeline documents (intent, context, spec, plan, tasks)
- Session README.md with architecture overview
- Resolved all architectural decisions for file-first, local-first approach

#### Changed
- **MAJOR**: Shifted from PR-first to WRITE_MODE=local architecture
  - Default behavior: write directly to workspace files, no git/PR operations
  - Rationale: Simplifies implementation, defers GitHub API complexity
  - External IDE/agency workflows handle git sync and PR creation
  - Governance checks still run on PRs (created externally)

#### Decisions Resolved
1. Backend runtime: Node.js LTS microservice
2. Storage: File-first (workspace repository, no automatic git/PR)
3. Auth: Bearer token via existing IDSE auth middleware
4. ACL model: Owner/Collaborator/Reader per-session
5. Rendering parity: Semantic equivalence (not exact HTML match)
6. Sample docs: Use session's own intent.md, spec.md, plan.md for tests
7. CI placement: GitHub Actions on external PRs
8. Write mode: Default WRITE_MODE=local

## [2025-12-30] Phase 0 — Foundations Completed

### Added
- Fastify + TypeScript scaffold at `backend/services/milkdown-crepe/` with GET/PUT/render routes, sanitizer pipeline, Dockerfile, and initial tests/fixtures.
- Documentation set: API.md, DEVELOPMENT.md, SECURITY.md, CONTRIBUTING.md; session metadata README updated.
- Session metadata files (`.owner`, changelog) finalized.

### Changed
- Framework choice finalized to **Fastify** (TypeScript ergonomics, performance, native zod integration).
- WRITE_MODE default confirmed as `local`; PR workflow deferred and gated by configuration.

### Testing
- Initial Vitest smoke tests for render pipeline and sanitizer; API smoke test added.

### Status
- **Current**: Phase 0 complete; Phase 1 security/test hardening in progress.
- **Next**: Implement JWT auth, path traversal guard, rate limiting + CORS + 5MB body limit, response schemas, structured error handling/logging, contract/integration tests, and pluggable ACL role provider (no git/PR work; WRITE_MODE=local only).

## [2025-12-30] Phase 1 — Security & ACL Completed

### Added
- **File-Based Role Provider**: Production-ready ACL implementation using `.owner` and `.collaborators` files
  - `FileRoleProvider` class reads session roles from filesystem (`src/services/roles/FileRoleProvider.ts`)
  - `.owner` file: Required, contains single userId (session owner)
  - `.collaborators` file: Optional, newline-separated userIds (collaborators)
  - SessionId format: `project:session` (e.g., "IDSE_Core:milkdown-crepe")
  - Role hierarchy: owner > collaborator > reader (default)
- **Pluggable Role Provider System**:
  - Configurable via `ROLE_PROVIDER` environment variable (file|memory|static)
  - `configureRoleProvider()` function in `src/services/roles.ts`
  - Wired into startup in `src/index.ts`
- **Comprehensive Test Suite**:
  - Unit tests for FileRoleProvider (12 tests): file parsing, role resolution, error handling, path mapping
  - Integration tests for file-based ACL (15 tests): GET/PUT/render endpoints, role hierarchy, permissions
  - Total: 50 tests passing (8 files / 22 original + 28 new tests)
- **Security Hardening** (completed in Codex handoff):
  - JWT authentication middleware
  - Path traversal protection
  - Rate limiting (100 req/min)
  - CORS configuration
  - 5MB body limit
  - Response schemas with Zod validation
  - Structured error handling and logging
  - Health endpoints (`/healthz`, `/readyz`)

### Changed
- `configureRoleProvider()` changed from sync to async to support dynamic imports
- `src/index.ts` now awaits role provider configuration
- ACL middleware (`src/middleware/acl.ts`) updated to construct sessionId from `project:session` params
- Test helper (`tests/helper.ts`) configures role provider based on `ROLE_PROVIDER` env var
- Default `ROLE_PROVIDER` set to 'file' in `src/config.ts`

### Documentation
- Updated `docs/API.md` with comprehensive ACL documentation:
  - Role model explanation (reader/collaborator/owner)
  - Role provider configuration options
  - File-based provider details with examples
  - SessionId format and file structure
  - Fallback behavior to JWT claims
- Updated `README.md` with ACL section, environment variables, and test counts
- Added inline documentation to `FileRoleProvider.ts` explaining file structure and role resolution

### Testing
- All tests passing: 50 tests across 10 test files
- Test breakdown:
  - Middleware tests: auth (3), ACL (3)
  - Service tests: FileRoleProvider unit tests (12)
  - Integration tests: filesystem (1), file-ACL (15), contracts (8)
  - Sanitizer and render tests (8)
- Governance validation: `validate-artifacts.py` PASS

### Status
- **Current**: Phase 1 ✅ COMPLETE
- **Ready for**: Production deployment (local mode only)
- **Deferred**: PR mode implementation (requires git/GitHub integration design)

## [2025-12-30/31] Phase 5 — Frontend Milkdown Editor Completed

### Added
- **Frontend Components** (Codex implementation 2025-12-30, Claude troubleshooting 2025-12-31):
  - `MilkdownEditor` component with Milkdown Crepe WYSIWYG editor (`frontend/widget/src/components/MilkdownEditor.tsx`)
  - `PipelineDocsEditor` wrapper combining FileTree sidebar + MilkdownEditor (`frontend/widget/src/components/PipelineDocsEditor.tsx`)
  - `FileTree` component displaying session directory structure (`frontend/widget/src/components/FileTree.tsx`)
  - `FilePickerDialog` for file selection (`frontend/widget/src/components/FilePickerDialog.tsx`)
  - `SessionTabs` for switching between Puck page builder and Pipeline Docs (`frontend/widget/src/components/SessionTabs.tsx`)
  - `WorkspacePage` integrating tabs and editors (`frontend/widget/src/components/WorkspacePage.tsx`)

- **Hooks & Services**:
  - `useMilkdownDocument` hook for document load/save/dirty state tracking (`frontend/widget/src/hooks/useMilkdownDocument.ts`)
  - `useSessionFiles` hook for listing session markdown files (`frontend/widget/src/hooks/useSessionFiles.ts`)
  - `milkdownApi` service with GET/PUT/render functions (`frontend/widget/src/services/milkdownApi.ts`)

- **TypeScript Types**:
  - `milkdown.ts` - API request/response types (DocumentResponse, SaveResponse, RenderResponse)
  - `fileTree.ts` - File tree node types

- **Features**:
  - Manual save button with dirty state tracking (no auto-save per user requirement)
  - Unsaved changes warning on navigation/close
  - Read-only mode for reader role
  - Error handling for 403/404/500 responses
  - File tree sidebar (25% width) with file selection
  - WYSIWYG markdown editing with Milkdown Crepe
  - Tabbed interface: "Page Builder" | "Pipeline Docs"

- **Dependencies**:
  - `@milkdown/crepe@^7.5.4` - WYSIWYG markdown editor
  - `@milkdown/core@^7.5.4` - Core Milkdown framework
  - `@milkdown/preset-commonmark@^7.5.4` - CommonMark support
  - `@milkdown/plugin-listener@^7.5.4` - Editor event listeners
  - `@milkdown/react@^7.5.4` - React integration
  - `vitest@^2.1.4` - Testing framework
  - `@testing-library/react@^16.2.0` - React testing utilities

### Fixed
- **Overlay Issue** (Claude 2025-12-31): Removed `@milkdown/crepe/theme/frame.css` import causing editor to display as modal overlay instead of inline component

### Changed
- Default API base URL: `http://localhost:8001` (configured via `VITE_MILKDOWN_API_URL`)
- Editor layout: 25% sidebar (FileTree) + 75% editor (MilkdownEditor) per user requirement
- Token authentication: Falls back to `localStorage.getItem("auth_token")` or `VITE_MILKDOWN_TOKEN`

### Testing
- Component tests created: `MilkdownEditor.test.tsx`, `FileTree.test.tsx`
- API client tests created: `milkdownApi.test.ts`
- Test coverage: Component rendering, file loading, save operations, read-only mode

### Documentation
- Component props documented inline with TypeScript interfaces
- API client functions fully typed
- Hook interfaces defined

### User Decisions Implemented
1. ✅ Integration: Tabbed interface (Puck | Pipeline Docs)
2. ✅ Document selection: File browser/tree view sidebar
3. ✅ Save: Manual save button only (no auto-save)
4. ✅ Preview: No preview mode (Crepe WYSIWYG sufficient)
5. ✅ Role handling: Read-only editor for reader role

### Status
- **Current**: Phase 5 ✅ COMPLETE
- **Backend**: Production-ready (49/49 tests passing)
- **Frontend**: Functional editor with all core features
- **Ready for**: End-to-end testing and deployment
- **Deferred**: PR mode remains deferred (backend+frontend)

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles.

Categories:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be-removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
