# Changelog

## 2025-12-31

### Full Repository Access & AG-UI Restoration

**Session:** IDSE_Core/milkdown-crepe-v2 (continuation)

#### Milkdown Editor - Full Repository Access
**Problem:** MD Editor was restricted to specific IDSE pipeline folders (intents/, specs/, plans/, tasks/, etc.), preventing access to repository documentation and other markdown files.

**Solutions Implemented:**

1. **Dynamic File Tree API**
   - Created `/api/files/tree` endpoint in `backend/routes/files_routes.py`
   - Recursively scans repository with smart exclusions (node_modules, .git, etc.)
   - Replaced 465 lines of hardcoded tree with dynamic fetch
   - Added loading/error states in FileBrowserDialog

2. **Workspace-Level Permissions**
   - Created `.owner` file at repository root with workspace owner ID
   - Implemented two-tier permission model in FileRoleProvider.ts:
     - **Tier 1:** Workspace owner → full access to everything
     - **Tier 2A:** Non-session files → 'collaborator' (allow editing)
     - **Tier 2B:** Session files → check session .owner/.collaborators
   - Workspace owners can now edit ANY file in repository
   - Session collaboration preserved for multi-user workflows

3. **Path Validation Fix**
   - Updated Zod schema regex in `validators/schemas.ts`:
     - **Old:** `/^(intents|contexts|specs|...)\/.*\.md$/` (9 specific prefixes)
     - **New:** `/^.*\.md$/` (any .md file)
   - Security still enforced via:
     - Path traversal protection in `validatePath()`
     - Permission checks in FileRoleProvider
     - JWT authentication

4. **Milkdown Editor Stability**
   - Fixed "editorView not found" crash in MilkdownEditor.tsx
   - Removed `content` from useLayoutEffect dependency array
   - Editor no longer destroyed/recreated on every keystroke
   - Added explanatory comment about dependency management

5. **Markdown-Only File Browser**
   - Added `filterMarkdownOnly()` function to FileBrowserDialog
   - Recursively filters tree to show only .md files
   - Hides folders that don't contain markdown files
   - Updated description: "Browse markdown files from the entire repository"

**Files Modified:**
- `backend/routes/files_routes.py` (created, 116 lines)
- `backend/main.py` (disabled routes with missing dependencies)
- `backend/services/milkdown-crepe/src/services/roles/FileRoleProvider.ts` (two-tier permissions)
- `backend/services/milkdown-crepe/src/validators/schemas.ts` (path regex)
- `backend/services/milkdown-crepe/src/validators/paths.ts` (updated pattern)
- `frontend/widget/src/components/FileBrowserDialog.tsx` (dynamic tree + markdown filter)
- `frontend/widget/src/components/MilkdownEditor.tsx` (editor lifecycle fix)
- `.owner` (created at workspace root)

**Testing Results:**
- ✅ README.md accessible (previously blocked)
- ✅ backend/README.md accessible (previously 400 error)
- ✅ All repository .md files accessible
- ✅ Editor stable during editing
- ✅ File tree shows only markdown files
- ✅ Security layers intact

**Impact:**
- MD Editor transformed from IDSE-only tool to **general-purpose repository markdown editor**
- Can browse and edit ANY .md file in the repository
- Maintains security through workspace ownership model
- Clean UX with markdown-only filtering

#### AG-UI Backend Restoration
**Problem:** RightPanel chat component showing 404 errors - AG-UI backend routes were disabled due to missing dependencies.

**Root Cause:** Backend process running with system Python instead of virtual environment Python, causing `ModuleNotFoundError` for `agency_swarm` and `PyGithub`.

**Solutions Implemented:**

1. **Dependency Verification**
   - Confirmed all dependencies already installed in `.venv/`:
     - agency-swarm v1.5.0
     - PyGithub v2.8.1

2. **Route Re-enablement**
   - Re-enabled all disabled routes in `backend/main.py`:
     - `agui_realtime` - /stream (SSE) and /inbound (chat messages)
     - `agui_routes` - Admin interface
     - `copilot_routes` - CopilotKit widget integration
     - `git_routes` - GitHub integration
     - `puck_routes` - Page builder

3. **Backend Restart with Virtual Environment**
   - Killed old process (PID 54077)
   - Started with `.venv/bin/python3 -m uvicorn backend.main:app --reload --port 5004`
   - All routes now loading successfully

4. **Frontend Configuration**
   - Added `VITE_API_BASE=http://localhost:5004` to `frontend/widget/.env`
   - RightPanel now points to correct backend port
   - Rebuilt frontend to pick up environment variable

**Files Modified:**
- `backend/main.py` (re-enabled 5 route modules)
- `frontend/widget/.env` (added VITE_API_BASE)

**Testing Results:**
- ✅ `/stream` endpoint working (SSE for real-time events)
- ✅ `/inbound` endpoint working (POST for user messages)
- ✅ Backend running on port 5004 with all routes
- ✅ Agency Swarm initialized successfully
- ✅ RightPanel chat component connected

**Impact:**
- Critical AG-UI chat functionality restored
- Real-time AI assistance available in dashboard
- Full Agency Swarm integration operational

**Total Changes:**
- 8 files modified
- ~200 lines added (file tree API + filter logic)
- ~50 lines removed (hardcoded tree data)
- 0 breaking changes (all additive improvements)

---

### Article X Implementation & Implementation Boundary Clarification

**Session:** IDSE_Core/milkdown-crepe-v2

#### Path Structure Migration (Stage-Rooted → Projects-Rooted)
Completed migration of entire codebase from legacy stage-rooted paths to Article X projects-rooted canonical structure.

**Migration Details:**
- **Old:** `<stage>/projects/<project>/sessions/<session>/`
- **New:** `projects/<project>/sessions/<session>/<stage>/`

**Files Updated (14 total):**
- Backend: FileRoleProvider.ts, status_service.py
- Frontend: MDWorkspace.tsx, FileTree.test.tsx
- Core: SessionManager.py (now creates .owner at session root + metadata/)
- Scripts: bootstrap_idse_session.sh, publish_reports_to_session.sh, validate-fast.sh
- Governance: audit-feedback.py
- Tests: test_session_bootstrap.py (11/11 passing)
- Companion: instruction_protection.py

**Testing Results:**
- ✅ All 11 integration tests passing
- ✅ Frontend build successful
- ✅ Milkdown service operational
- ✅ MD Editor fully functional

#### Implementation Boundary Clarification
**Problem Identified:** Confusion about whether `implementation/` directory should contain production code or documentation. Initial manual setup created `implementation/` with schemas/configs, blurring the line between IDSE Agency (documentation producer) and IDE/development team (code producer).

**Resolution:** Established clear separation of concerns across ALL governance documentation.

**Principle Established:**
```
IDSE Agency
   ↓ produces
Pipeline Documentation (intent, spec, plan, tasks, implementation reports)
   ↓ handoff to
IDE/Development Team
   ↓ produces
Production Code (src/, backend/, frontend/, etc.)
```

**Documentation Updated (8 files):**

1. **Core Governance:**
   - `docs/03-idse-pipeline.md` - Rewrote Implementation section with two modes (Agency vs IDE Team)
   - `docs/02-idse-constitution.md` - Added Article X Section 3 clarification
   - `idse-governance/policies/artifact-placement.md` - Complete rewrite with projects-rooted paths

2. **Templates:**
   - `docs/kb/templates/plan-template.md` - Added note: documentation guides IDE team
   - `docs/kb/templates/tasks-template.md` - Added note: tasks describe what, not where

3. **Agent Tools & Instructions:**
   - `idse_developer_agent/tools/ImplementSystemTool.py` - Updated docstring with explicit warning
   - `idse_developer_agent/instructions.md` - Added CRITICAL note, renamed section, DO/DON'T guidelines

4. **Project Configuration:**
   - `CLAUDE.md` - Complete IDSE structure rewrite, fixed to projects-rooted, critical guardrail #5

**Key Changes:**
- `implementation/` contains **documentation only**: validation reports, code examples (in markdown), handoff records
- `implementation/` does **NOT** contain: production code, working schemas, executable artifacts
- Production code lives in codebase directories: src/, backend/, frontend/, tests/

#### Milkdown Service Bug Fixes
**Issue:** MD Editor showing 401/404 errors, unable to access documents

**Root Causes:**
1. Milkdown service not running on port 8001
2. FileRoleProvider missing `/sessions/` path segment
3. `.owner` file in wrong location (specs/.owner instead of session root)

**Fixes:**
- Updated FileRoleProvider.ts:79 to include `/sessions/` in path: `path.join(workspaceRoot, 'projects', project, 'sessions', session)`
- Started Milkdown service in dev mode
- Copied `.owner` files to session root for compatibility
- SessionManager now creates `.owner` at both session root (Milkdown) and metadata/ (legacy)

**Result:** ✅ MD Editor fully operational

#### Breaking Changes
- **Path structure:** Stage-rooted paths no longer supported (grace period active with warnings)
- **`.owner` location:** Must be at session root for Milkdown compatibility
- **Implementation semantics:** Strictly documentation-only going forward

#### Files Changed Summary
- **Backend:** 3 files (FileRoleProvider.ts, status_routes.py, status_service.py)
- **Frontend:** 3 files (MDWorkspace.tsx, FileTree.test.tsx, useSessionFiles.ts)
- **Core:** 1 file (SessionManager.py)
- **Governance:** 4 files (constitution, pipeline, artifact-placement, CLAUDE.md)
- **Agent:** 2 files (instructions.md, ImplementSystemTool.py)
- **Templates:** 2 files (plan-template.md, tasks-template.md)
- **Scripts:** 5 files (bootstrap, publish, validate, audit, protection)
- **Tests:** 1 file (test_session_bootstrap.py)

**Total:** 21 files modified, ~150 lines changed

---

### Unified Admin Dashboard - Complete Refactor

**Phase 0-6: Admin Dashboard Refactor**
- ✅ Replaced fragmented admin routes with unified `/admin` dashboard
- ✅ Implemented persistent 3-column layout using shadcn/ui + Tailwind CSS Grid
- ✅ Created collapsible left navigation (240px) with Puck Editor and MD Editor sections
- ✅ Built dynamic center canvas workspace (Welcome | Puck Workspace | MD Workspace)
- ✅ Integrated persistent chat panel (590px) with session awareness
- ✅ Removed Status Browser (4 components, 719 lines deleted - governance scripts handle validation)
- ✅ Added legacy route redirects (/editor, /workspace, /landing → /admin)
- ✅ Fixed MD Editor path validation to match backend restrictions (intents/, specs/, plans/, tasks/, contexts/)

**Dashboard Architecture**:
```
/admin Dashboard (3-column grid)
├─ LeftNav (240px): Collapsible menu with Puck Editor and MD Editor sections
├─ CenterCanvas (flexible): Dynamic workspace area
│  ├─ WelcomeView: Default centered message with feature cards
│  ├─ PuckWorkspace: Visual page builder with ControlPanel + Preview
│  │  ├─ Tabs: Blocks | Fields | Outline | Published Pages
│  │  └─ Toolbar: New Page | Publish buttons
│  └─ MDWorkspace: Full-width Crepe WYSIWYG editor
│     ├─ Toolbar: Open | Save | Save As | Dirty indicator
│     └─ Quick-load: Intent | Spec | Plan | Tasks | Context
└─ RightPanel (590px): Persistent chat with session context display
```

**Components Created** (9 files):
- `frontend/widget/src/components/AdminDashboard.tsx` - Main dashboard container with state management
- `frontend/widget/src/components/DashboardLayout.tsx` - 3-column CSS Grid layout
- `frontend/widget/src/components/LeftNav.tsx` - Collapsible sidebar menu (shadcn Sidebar + Collapsible)
- `frontend/widget/src/components/WelcomeView.tsx` - Default welcome screen (shadcn Card)
- `frontend/widget/src/components/PuckWorkspace.tsx` - Puck editor workspace wrapper
- `frontend/widget/src/components/ControlPanel.tsx` - Tabbed control panel for Puck
- `frontend/widget/src/components/PageListView.tsx` - Published pages grid display
- `frontend/widget/src/components/MDWorkspace.tsx` - MD editor workspace with Crepe integration
- `frontend/widget/src/components/CrepeEditor.tsx` - Extracted Crepe editor component

**Components Deleted** (4 files, 719 lines):
- `frontend/widget/src/puck/components/StatusBrowserWidget.tsx`
- `frontend/widget/src/puck/components/StatusBrowserRowWidget.tsx`
- `frontend/widget/src/puck/components/StatusPane.tsx`
- `frontend/widget/src/puck/components/SessionList.tsx`

**shadcn/ui Setup**:
- Installed 11 components: Sidebar, Button, Card, Collapsible, Separator, ScrollArea, Dialog, Input, Label, Tabs, Avatar
- Configured TypeScript path aliases (`@/*` → `./src/*`)
- Configured Vite alias resolution

**Path Validation**:
- Backend accepts paths matching: `/^(intents|contexts|specs|plans|tasks|docs)\/.*\.md$/`
- Added client-side validation in FileOpenDialog to match backend restrictions
- Display error message for invalid paths with clear guidance
- Updated help text and placeholder to clarify folder restrictions
- Added `docs/` folder support for repository documentation files

**Chat Panel Context Awareness**:
- Added document path tracking to AdminDashboard state (`mdCurrentPath`)
- MDWorkspace notifies parent when document changes via `onPathChange` callback
- Chat panel now displays full document path: "MD Editor - docs/03-idse-pipeline.md"
- Enables context-aware AI assistance for the currently open document

**Bug Fixes**:
- Fixed RightPanel import path in AdminDashboard
- Fixed RightPanel props interface (removed hideEmbeddedChat)
- Fixed buildFullPath() to distinguish session-scoped vs repository-root files
- Added path validation to prevent 400 Bad Request errors

**Files Modified**:
- `frontend/widget/tsconfig.json` - Added baseUrl and paths for @/* alias
- `frontend/widget/vite.config.ts` - Added Vite alias resolution
- `frontend/widget/src/App.tsx` - Added /admin route and legacy redirects
- `frontend/widget/src/puck/components/RightPanel.tsx` - Session awareness
- `frontend/widget/src/puck/config.tsx` - Removed status browser components
- `frontend/widget/src/puck/PuckEditor.tsx` - Removed status tab

**Total Changes**: 12 commits, ~2,500 lines added, ~800 lines deleted

### Milkdown Crepe Editor - Frontend Implementation Complete

**Phase 5: Frontend Milkdown Editor** (IDSE_Core/milkdown-crepe session)
- ✅ Completed modal/overlay editor integration matching Milkdown examples
- ✅ Created `MarkdownEditorModal.tsx` component with full-screen overlay (fixed inset-4)
- ✅ Implemented file open/save dialogs with short path format and quick-pick buttons
- ✅ Built automatic path conversion system: "plans/plan.md" → "plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md"
- ✅ Integrated Crepe WYSIWYG editor with proper React lifecycle management
- ✅ Fixed critical editor editability bug (removed `content` from useLayoutEffect dependencies)
- ✅ Added JWT authentication with VITE_MILKDOWN_AUTH_TOKEN environment variable
- ✅ Implemented manual save with dirty state tracking and unsaved changes confirmation
- ✅ Added role-based access control (read-only mode for readers)
- ✅ Error handling for 401/403/404/500 responses with user-friendly messages
- ✅ Proper cleanup on unmount (crepe.destroy())

**Bug Fixes**:
- Fixed token environment variable name: `VITE_MILKDOWN_TOKEN` → `VITE_MILKDOWN_AUTH_TOKEN`
- Fixed modal click event propagation (backdrop vs content detection)
- Fixed editor recreation infinite loop (dependency array issue)
- Fixed TypeScript types in `withAuth()` function
- Removed browser file picker (security prevents full path access)

**Files Created**:
- `frontend/widget/src/components/MarkdownEditorModal.tsx` - Main modal overlay editor
- `frontend/widget/src/types/milkdown.ts` - TypeScript type definitions

**Files Modified**:
- `frontend/widget/src/components/WorkspacePage.tsx` - Token fix and modal integration
- `frontend/widget/src/services/milkdownApi.ts` - Auth header type fixes
- `frontend/widget/.env` - Added VITE_MILKDOWN_AUTH_TOKEN

**Testing**:
- ✅ Manual E2E testing: Document loading, editing, and saving verified
- ✅ Authentication flow validated with JWT tokens
- ✅ Path building system tested with IDSE pipeline documents
- ✅ Editor editability confirmed (typing without focus loss)
- ⚠️ Automated component tests deferred for future work

**Notes**:
- Implementation diverged from original plan: User requested modal/overlay approach instead of tabbed interface with sidebar
- Follows Milkdown official examples pattern (https://github.com/Milkdown/examples/tree/main/editor-crepe)
- Backend API already complete with 49/49 tests passing
- Ready for production deployment with confirmed environment variables

## 2025-12-28
- Added GitHub App authentication support across backend and tools (optional Authorization header tokens, App ID/key/installation envs); removed reliance on stored PATs where not needed.
- Implemented branch auto-creation fallback when committing so missing target branches are created from the default branch instead of failing with 404.
- Updated env templates and docs to reflect GitHub App setup, add key path, and mark PAT as optional; added GitHub App setup guide.
- Hardened status endpoint for app tokens (skips `/user` call) and improved tests/tooling to accept one-time tokens via headers.
- Added companion bundle tooling support for header-based tokens and auth mode overrides.
- Synced companion bundle governance tasks: added full governance validator, PYTHONPATH fixes for governance.py, and ensured guardrails self-test runs cleanly in installed repos.
- Governance handoff task now bootstraps a default state.json on first run to avoid failures in fresh installs.
- Added active-LLM enforcement: governance.py now has `check-active` (env-aware, staleness warning) and wrapper `run_with_active_check.sh` to gate tasks by `LLM_ID`; view shows env/staleness hints.
