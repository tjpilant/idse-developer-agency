# Handoff: Claude → Codex

## Metadata
- Cycle ID: 2025-12-30T22-50-00Z
- From: claude_code
- To: codex_gpt
- Timestamp: 2025-12-30T22:50:00Z
- IDSE Stage: Implementation
- Plan Reference: plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md

## Executive Summary

**Backend ✅ COMPLETE** → **Frontend needed**

The milkdown-crepe backend API is production-ready (Phase 0-4 complete, 49/49 tests passing). However, **the frontend Milkdown editor UI was never built** - it was marked as "optional follow-up (parking lot)" in original tasks and deferred.

**User has confirmed**: We need to build the frontend editor to complete this project.

---

## What's Complete (Backend)

### Backend API - Production Ready
- **Status**: Phase 0-4 complete (2025-12-30)
- **Tests**: 49/49 passing
- **Governance**: validate-artifacts PASS
- **Location**: `backend/services/milkdown-crepe/`

**Endpoints**:
- `GET /api/sessions/:project/:session/documents?path=<path>` - Read IDSE pipeline docs (requires reader role)
- `PUT /api/sessions/:project/:session/documents` - Edit/save docs (requires collaborator role)
- `POST /api/sessions/:project/:session/render` - Render markdown to sanitized HTML (requires reader role)
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

**Security**:
- JWT Bearer authentication
- File-based ACL (owner/collaborator/reader roles)
- Rate limiting (100 req/min)
- CORS (localhost:3000, 5173 + FRONTEND_URL)
- 5MB body limit
- Path traversal protection
- Response schema validation (Zod)

**ACL Implementation**:
- Default: FileRoleProvider (reads `.owner` and `.collaborators` files from `projects/{project}/{session}/`)
- SessionId format: `"project:session"` (e.g., `"IDSE_Core:milkdown-crepe"`)
- Role hierarchy: owner > collaborator > reader (default)
- Fallback to JWT roles if file provider returns none

**Documentation**: All docs complete
- `backend/services/milkdown-crepe/docs/API.md` - API reference
- `backend/services/milkdown-crepe/docs/SECURITY.md` - Security details
- `backend/services/milkdown-crepe/docs/DEVELOPMENT.md` - Dev guide
- `backend/services/milkdown-crepe/README.md` - Quick start

---

## What Needs Building (Frontend)

### Phase 5: Frontend Milkdown Editor

**Discovery**: No frontend code exists for Milkdown/Crepe editor
- Searched entire repo - no `@milkdown/*` dependencies
- No React components using Milkdown/Crepe
- Frontend currently has only Puck page builder components

**User Decisions** (gathered via AskUserQuestion):
1. **Integration**: ✅ **Tabbed interface** - Add tabs to switch between Puck and Milkdown editors
2. **Document selection**: ✅ **File browser/tree view** - Sidebar showing session .md files
3. **Save behavior**: ✅ **Manual save button only** - No auto-save, explicit save
4. **Preview mode**: ✅ **No preview** - Crepe WYSIWYG is sufficient
5. **Role handling**: ✅ **Read-only editor for readers** - Show badge, disable save

---

## Implementation Plan for Codex

### Phase 5 Tasks (from tasks.md)

**T5.1: Foundation & API Client**
- Install: `npm install @milkdown/crepe @milkdown/core @milkdown/preset-commonmark @milkdown/plugin-listener`
- Create: `frontend/widget/src/services/milkdownApi.ts`
  - Functions: `getDocument()`, `putDocument()`, `renderMarkdown()`
  - Uses: `VITE_MILKDOWN_API_URL` env var (default: http://localhost:3001)
  - Auth: Bearer token from existing auth context
- Create: `frontend/widget/src/types/milkdown.ts`
  - Interfaces for Document, metadata, API responses

**T5.2: File Browser Component**
- Create: `frontend/widget/src/components/FileTree.tsx`
  - Display session directory structure (intents/, specs/, plans/, tasks/)
  - Filter to .md files only
  - Click to select file for editing
  - Highlight currently open file
- Create: `frontend/widget/src/hooks/useSessionFiles.ts`
  - Hook to list/fetch session .md files
- Create: `frontend/widget/src/types/fileTree.ts`
  - Types for file tree structure

**T5.3: Editor Component**
- Create: `frontend/widget/src/components/MilkdownEditor.tsx`
  - Initialize Crepe editor with `useLayoutEffect`
  - Cleanup with `crepe.destroy()` on unmount
  - Show toolbar: document title, save button, role badge, dirty indicator
  - Manual save button (enabled only when dirty)
  - Read-only mode for reader role
  - Error handling (404, 403, 500)
  - Confirm navigation if unsaved changes
- Create: `frontend/widget/src/hooks/useMilkdownDocument.ts`
  - Document loading (GET endpoint)
  - Document saving (PUT endpoint)
  - Dirty state tracking
  - Error handling

**T5.4: Tabbed Integration**
- Create: `frontend/widget/src/components/SessionTabs.tsx`
  - Tab switcher: "Page Builder" | "Pipeline Docs"
- Create: `frontend/widget/src/components/PipelineDocsEditor.tsx`
  - Wrapper combining FileTree (25% sidebar) + MilkdownEditor (75%)
- Modify: `frontend/widget/src/components/SessionPage.tsx` (or equivalent)
  - Add tab UI
  - Wire up tab state management

**T5.5: Testing**
- Create: `frontend/widget/src/components/MilkdownEditor.test.tsx`
- Create: `frontend/widget/src/components/FileTree.test.tsx`
- Create: `frontend/widget/src/services/milkdownApi.test.ts`
- Test coverage:
  - Mock API responses
  - Document loading/saving
  - Error states (403, 404, 500)
  - Read-only mode
  - Dirty state tracking
  - Unsaved changes confirmation
  - File tree selection
  - Tab switching

**T5.6: Documentation**
- Update: `frontend/widget/README.md` with Milkdown editor usage
- Document environment variables
- Add user guide for Pipeline Docs tab

---

## Critical Implementation Details

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Tabs: [Page Builder] [Pipeline Docs]  │
├─────────────────────────────────────────┤
│  Sidebar (25%)  │  Editor (75%)         │
│                 │                       │
│  FileTree       │  MilkdownEditor       │
│  📁 intents/    │  ┌─────────────────┐ │
│    - intent.md  │  │ Save    [Dirty] │ │
│  📁 specs/      │  ├─────────────────┤ │
│    - spec.md    │  │                 │ │
│  📁 plans/      │  │  # Intent       │ │
│    - plan.md    │  │                 │ │
│  📁 tasks/      │  │  ...            │ │
│    - tasks.md   │  └─────────────────┘ │
└─────────────────────────────────────────┘
```

### API Client Example
```typescript
// frontend/widget/src/services/milkdownApi.ts
const API_BASE = import.meta.env.VITE_MILKDOWN_API_URL || 'http://localhost:3001';

export interface Document {
  path: string;
  content: string;
  metadata: {
    owner: string;
    schema_version: string;
    updated_at: string;
  };
}

export async function getDocument(
  project: string,
  session: string,
  path: string,
  token: string
): Promise<Document> {
  const res = await fetch(
    `${API_BASE}/api/sessions/${project}/${session}/documents?path=${encodeURIComponent(path)}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Failed to load document: ${res.status}`);
  return res.json();
}

export async function putDocument(
  project: string,
  session: string,
  path: string,
  content: string,
  token: string
): Promise<{ path: string; saved: boolean; mode: string }> {
  const res = await fetch(
    `${API_BASE}/api/sessions/${project}/${session}/documents`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, content }),
    }
  );
  if (!res.ok) throw new Error(`Failed to save document: ${res.status}`);
  return res.json();
}
```

### MilkdownEditor Component Structure
```typescript
// frontend/widget/src/components/MilkdownEditor.tsx
interface MilkdownEditorProps {
  project: string;
  session: string;
  path: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
}

export function MilkdownEditor(props: MilkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize Crepe
  useLayoutEffect(() => {
    if (editorRef.current) {
      crepeRef.current = new Crepe({
        root: editorRef.current,
        defaultValue: '',
        // readOnly config
      });
    }

    return () => {
      crepeRef.current?.destroy();
    };
  }, []);

  // Load document
  useEffect(() => {
    loadDocument();
  }, [project, session, path]);

  // Manual save
  const handleSave = async () => {
    // Save via PUT endpoint
    // Clear dirty state
  };

  return (
    <div>
      <div className="toolbar">
        <button disabled={!isDirty} onClick={handleSave}>Save</button>
        {isDirty && <span className="dirty-indicator">●</span>}
      </div>
      <div ref={editorRef} />
    </div>
  );
}
```

---

## Files Reference

### Backend (Complete - Reference Only)
- `backend/services/milkdown-crepe/src/index.ts` - Server entry
- `backend/services/milkdown-crepe/src/routes/documents.ts` - GET/PUT routes
- `backend/services/milkdown-crepe/src/routes/render.ts` - Render route
- `backend/services/milkdown-crepe/src/middleware/acl.ts` - ACL middleware
- `backend/services/milkdown-crepe/src/services/roles/FileRoleProvider.ts` - Role provider
- `backend/services/milkdown-crepe/docs/API.md` - **READ THIS FIRST** for API contracts

### Frontend (To Create)
Phase 1:
- `frontend/widget/src/services/milkdownApi.ts`
- `frontend/widget/src/types/milkdown.ts`

Phase 2:
- `frontend/widget/src/components/FileTree.tsx`
- `frontend/widget/src/hooks/useSessionFiles.ts`
- `frontend/widget/src/types/fileTree.ts`

Phase 3:
- `frontend/widget/src/components/MilkdownEditor.tsx`
- `frontend/widget/src/hooks/useMilkdownDocument.ts`

Phase 4:
- `frontend/widget/src/components/SessionTabs.tsx`
- `frontend/widget/src/components/PipelineDocsEditor.tsx`
- Modify: `frontend/widget/src/components/SessionPage.tsx`

Phase 5:
- `frontend/widget/src/components/MilkdownEditor.test.tsx`
- `frontend/widget/src/components/FileTree.test.tsx`
- `frontend/widget/src/services/milkdownApi.test.ts`

### Frontend (To Modify)
- `frontend/widget/package.json` - Add dependencies
- `frontend/widget/.env` - Add VITE_MILKDOWN_API_URL=http://localhost:3001

---

## Acceptance Criteria

### Must Have (MVP)
- ✅ Milkdown Crepe integrated and rendering WYSIWYG markdown
- ✅ Documents load from backend GET endpoint
- ✅ Manual save button writes via PUT endpoint
- ✅ Dirty state tracking (unsaved changes indicator)
- ✅ Read-only mode for reader role
- ✅ File tree shows session .md files (intents/, specs/, plans/, tasks/)
- ✅ Tab switching between Puck and Pipeline Docs works
- ✅ Error handling for 403/404/500 responses
- ✅ Component properly cleans up (crepe.destroy())
- ✅ No console errors or warnings

### Nice to Have
- Keyboard shortcut (Cmd+S / Ctrl+S) to save
- Toast notifications for save success/failure
- Loading spinners
- Empty state when no file selected
- Confirmation dialog before tab switch if dirty

---

## Testing Strategy

### Unit Tests
- API client functions (mock fetch)
- useMilkdownDocument hook (mock API responses)
- useSessionFiles hook

### Component Tests
- MilkdownEditor: load, edit, save, dirty state, read-only
- FileTree: display files, selection, highlighting
- SessionTabs: tab switching
- PipelineDocsEditor: layout, integration

### Integration Tests
- Full flow: select file → load → edit → save
- Error handling: 403 forbidden, 404 not found
- Role-based access: reader can't save

### Manual E2E (with backend running)
1. Start backend: `cd backend/services/milkdown-crepe && npm run dev`
2. Start frontend: `cd frontend/widget && npm run dev`
3. Test scenarios:
   - Load intent.md, edit, save
   - Switch files in tree
   - Switch tabs (Puck ↔ Pipeline Docs)
   - Try to save as reader (should fail)
   - Navigate away with unsaved changes (should warn)

---

## Environment Setup

### Backend (Already Running)
```bash
cd backend/services/milkdown-crepe
npm install
cp .env.example .env
# Set: AUTH_SECRET, WORKSPACE_ROOT=/home/tjpilant/projects/idse-developer-agency
npm run dev  # Runs on http://localhost:3001
```

### Frontend (To Set Up)
```bash
cd frontend/widget
npm install @milkdown/crepe @milkdown/core @milkdown/preset-commonmark @milkdown/plugin-listener
echo "VITE_MILKDOWN_API_URL=http://localhost:3001" >> .env
npm run dev  # Runs on http://localhost:5173
```

---

## Known Constraints

1. **No Auto-Save**: User explicitly requested manual save only
2. **No Preview Mode**: Crepe WYSIWYG is sufficient (no separate HTML preview)
3. **File Listing**: Need to implement file discovery (backend doesn't have list endpoint yet)
   - **Option A**: Frontend reads directory structure via filesystem API
   - **Option B**: Add GET /api/sessions/:project/:session/files endpoint to backend
   - **Recommendation**: Use Option A for now (client-side glob pattern matching)
4. **Auth**: Reuse existing `useAuth()` context from frontend/widget
5. **Styling**: Use existing Tailwind CSS classes to match Puck UI

---

## Success Metrics

- ✅ All T5.1-T5.6 tasks marked complete in tasks.md
- ✅ Frontend tests passing
- ✅ Manual E2E test successful
- ✅ No TypeScript errors
- ✅ No console errors/warnings
- ✅ User can edit and save IDSE pipeline documents (intent, spec, plan, tasks)

---

## References

- **Backend API Docs**: `backend/services/milkdown-crepe/docs/API.md` ← **Start here**
- **Milkdown Crepe Docs**: https://milkdown.dev/docs/guide/crepe
- **Frontend Structure**: `frontend/widget/src/`
- **Plan File**: `~/.claude/plans/indexed-splashing-lamport.md` (detailed component specs)
- **Tasks File**: `tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md`
- **Project Plan**: `plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md`

---

## Questions for Codex

1. **File Listing**: Should we add a backend endpoint for listing session files, or handle client-side?
2. **Auth Integration**: Confirm `useAuth()` hook is available in frontend/widget/src/contexts/AuthContext.tsx
3. **SessionPage Location**: Which component should we modify to add tabs? (SessionPage.tsx? Different name?)
4. **Styling Preferences**: Any specific Tailwind classes or design system to follow?

---

## Handoff Checklist

- [x] Backend complete and tested (49/49 tests passing)
- [x] User decisions gathered (integration, save behavior, preview, roles)
- [x] Tasks updated (T5.1-T5.6 added to tasks.md)
- [x] Plan updated (Phase 5 added to plan.md)
- [x] Detailed implementation guide provided
- [x] API contracts documented
- [x] Component structure specified
- [x] Acceptance criteria defined
- [x] Testing strategy outlined
- [ ] Codex implements frontend (T5.1-T5.6)
- [ ] Tests pass
- [ ] Manual E2E successful
- [ ] Changelog updated with Phase 5
- [ ] Handoff back to Claude for review

---

## Next Actions for Codex

1. **Read backend API.md**: `backend/services/milkdown-crepe/docs/API.md` - understand API contracts
2. **Install dependencies**: `npm install @milkdown/crepe ...` in frontend/widget
3. **Create API client**: Start with milkdownApi.ts and types
4. **Build FileTree**: Simple file list first, then tree structure
5. **Build MilkdownEditor**: Get Crepe rendering, then add save/dirty tracking
6. **Integrate tabs**: Wire everything together
7. **Test**: Unit tests, then manual E2E with backend running
8. **Update changelog**: Add Phase 5 entry to `projects/IDSE_Core/milkdown-crepe/changelog.md`

---

**Status**: Ready for Codex implementation

**Estimated Effort**: 4-5 hours focused development

**Priority**: High - This completes the milkdown-crepe project

---

Good luck! The backend is solid and well-tested, so you have a reliable API to work against. Let me know if you have any questions about the backend behavior or need clarification on any of the requirements.
