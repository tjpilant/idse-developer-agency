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

Phase 5 — Frontend Milkdown Editor (current - 2025-12-30)

**User Decisions**:
- Integration: Tabbed interface (Puck | Pipeline Docs)
- Document selection: File browser/tree view
- Save: Manual save button only (no auto-save)
- Preview: No preview mode (Crepe WYSIWYG sufficient)
- Role handling: Read-only editor for readers

T5.1: Phase 1 - Foundation & API Client
- Owner: frontend-dev
- Install dependencies: @milkdown/crepe, @milkdown/core, @milkdown/preset-commonmark, @milkdown/plugin-listener
- Create API client: frontend/widget/src/services/milkdownApi.ts (GET/PUT/render)
- Create TypeScript types: frontend/widget/src/types/milkdown.ts
- Add env var: VITE_MILKDOWN_API_URL=http://localhost:3001

T5.2: Phase 2 - File Browser Component
- Owner: frontend-dev
- Create FileTree component: frontend/widget/src/components/FileTree.tsx
- Create useSessionFiles hook: frontend/widget/src/hooks/useSessionFiles.ts
- Create types: frontend/widget/src/types/fileTree.ts
- Display session directory structure (intents/, specs/, plans/, tasks/)
- Filter to .md files only
- Click to select file for editing
- Style with Tailwind CSS

T5.3: Phase 3 - Editor Component
- Owner: frontend-dev
- Create MilkdownEditor: frontend/widget/src/components/MilkdownEditor.tsx
- Create useMilkdownDocument hook: frontend/widget/src/hooks/useMilkdownDocument.ts
- Implement Crepe initialization with useLayoutEffect
- Add manual save button with dirty state tracking
- Implement read-only mode for reader role
- Add error handling (404, 403, 500)
- Ensure proper cleanup (crepe.destroy())
- Add unsaved changes confirmation

T5.4: Phase 4 - Tabbed Integration
- Owner: frontend-dev
- Create SessionTabs: frontend/widget/src/components/SessionTabs.tsx
- Create PipelineDocsEditor: frontend/widget/src/components/PipelineDocsEditor.tsx
- Modify SessionPage.tsx to add tab UI (Puck | Pipeline Docs)
- Wire up tab state management
- Layout: 25% sidebar (FileTree) + 75% editor (MilkdownEditor)

T5.5: Phase 5 - Testing
- Owner: qa-engineer
- Write component tests: MilkdownEditor.test.tsx, FileTree.test.tsx
- Write API client tests: milkdownApi.test.ts
- Test unsaved changes confirmation
- Test role-based access (read-only mode)
- Manual end-to-end testing with backend API

T5.6: Documentation
- Owner: interactive-user
- Update frontend README with Milkdown editor usage
- Document environment variables
- Add user guide for Pipeline Docs tab

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
