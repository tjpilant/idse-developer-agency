# Changelog

## 2025-12-31

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
