# Tasks – Project_Status_Browser Visual Page Editor & Renderer

Source plan: `/plans/projects/Project_Status_Browser/sessions/session-1765832163/plan.md`

[P] = parallel safe

## Instructions
- Tasks are derived directly from the implementation plan and spec.
- For each task, fill in owner, dependencies, and acceptance/validation notes during sprint planning.
- Keep tasks independent and testable; mark parallelizable tasks with `[P]`.

---

## Phase 0 – Foundations (Data Model & Storage)

- [ ] **Task 0.1 [P] – Define core types and schema for PageData**  
  **Description:** Implement TypeScript types for `PageData` and `ComponentData` and a JSON schema (or equivalent) that validates the core structure (id, slug, title, schemaVersion, root).  
  **Owner:** _(TBD)_  
  **Deps:** None.  
  **Acceptance:**
  - Types compile.
  - At least one valid `PageData` example passes validation.
  - Invalid examples (missing `root`, missing `schemaVersion`) fail validation.

- [ ] **Task 0.2 [P] – Add status_pages storage**  
  **Description:** Create DB migration (or equivalent) for `status_pages` with fields: `id`, `slug`, `title`, `schema_version`, `data` (JSON), timestamps. Implement a `StatusPageRepository` with basic CRUD operations.  
  **Owner:** _(TBD)_  
  **Deps:** Task 0.1 for schema; existing DB access layer.  
  **Acceptance:**
  - Migration applies successfully in dev/test.
  - Repository can create/read/update/delete rows in tests.

- [ ] **Task 0.3 [P] – Integrate JSON schema validation in backend**  
  **Description:** Wire JSON schema validation into the API stack so that incoming `PageData` payloads can be validated before persistence.  
  **Owner:** _(TBD)_  
  **Deps:** Task 0.1.  
  **Acceptance:**
  - Invalid `PageData` payloads to a test endpoint are rejected with 4xx.
  - Validation errors are logged and easy to trace.

---

## Phase 1 – Core Behavior (View Route & Renderer)

- [ ] **Task 1.1 – Implement GET /api/status-pages/:slug**  
  **Description:** Add a GET endpoint that loads `PageData` from `StatusPageRepository` by `slug` and returns `{ page: PageData }`.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 0.2, 0.3.  
  **Acceptance:**
  - `GET /api/status-pages/:slug` returns 200 with a valid `PageData` for existing pages.
  - Nonexistent `slug` returns 404.

- [ ] **Task 1.2 – Implement component registry and StatusPageRenderer**  
  **Description:** Create `componentRegistry` and `StatusPageRenderer` capable of rendering at least `DashboardLayout`, `StatusHeader`, `StatusCard`, and `TextBlock` based on `ComponentData`.  
  **Owner:** _(TBD)_  
  **Deps:** Task 0.1.  
  **Acceptance:**
  - A hard-coded `PageData` with a `DashboardLayout` root and a few child components renders as expected in a story or dev route.

- [ ] **Task 1.3 – Implement /status/:slug view route**  
  **Description:** Add a frontend route (or Next.js page) that fetches `PageData` from the API and renders it via `StatusPageRenderer`.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 1.1, 1.2.  
  **Acceptance:**
  - Visiting `/status/sample-slug` renders a sample JSON-defined page.

---

## Phase 2 – Editor & Save/Load

- [ ] **Task 2.1 – Implement PUT /api/status-pages/:slug**  
  **Description:** Add an authenticated endpoint that accepts `{ page: PageData }`, validates it, and persists it as the new JSON for the given `slug`.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 0.2, 0.3, 1.1.  
  **Acceptance:**
  - Valid payloads update the stored page and are returned by subsequent GETs.
  - Invalid payloads are rejected with clear 4xx responses.

- [ ] **Task 2.2 – Build basic StatusPageEditor shell**  
  **Description:** Implement `StatusPageEditor` that:
  - Fetches `PageData` via `GET /api/status-pages/:slug` on mount.
  - Holds page state in memory.
  - Renders a simple preview using `StatusPageRenderer` or a similar tree.
  - Includes a Save button that calls `PUT /api/status-pages/:slug` with the updated `PageData`.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 1.1, 1.2, 2.1.  
  **Acceptance:**
  - A user can change a header title in the editor, click Save, and see the updated title on `/status/:slug` after reload.

- [ ] **Task 2.3 – Implement /status/:slug/edit route with auth guard**  
  **Description:** Add a frontend route (or Next.js page) for `/status/:slug/edit` which:
  - Requires authentication/authorization.
  - Renders `StatusPageEditor`.  
  **Owner:** _(TBD)_  
  **Deps:** Task 2.2; existing auth system.  
  **Acceptance:**
  - Authorized users can access `/status/:slug/edit` and see the editor.
  - Unauthorized users are redirected or receive an error.

---

## Phase 3 – Layout & Slots

- [ ] **Task 3.1 – Implement GridLayout and ColumnLayout components**  
  **Description:** Extend the component registry and renderer to support:
  - `GridLayout` with `columns`, `gap`, and `items` slots.
  - `ColumnLayout` with `left`, `right`, and `ratio` props.  
  **Owner:** _(TBD)_  
  **Deps:** Task 1.2.  
  **Acceptance:**
  - Sample JSON using `GridLayout` and `ColumnLayout` renders correctly via `StatusPageRenderer`.

- [ ] **Task 3.2 – Editor support for adding/removing components in slots**  
  **Description:** Enhance the editor (and `EditorCanvas`) to:
  - Allow inserting components into a specific slot (e.g., `DashboardLayout.header`, `GridLayout.items`).
  - Allow removing components from those slots.
  - Ensure changes update the in-memory `PageData`.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 2.2, 3.1.  
  **Acceptance:**
  - A user can add and remove `StatusCard` components under `GridLayout.items` and see them reflected in `/status/:slug` after save.

- [ ] **Task 3.3 – Editor support for reordering within slots**  
  **Description:** Implement reordering (drag & drop or up/down controls) within slot arrays (e.g., order of `GridLayout.items`).  
  **Owner:** _(TBD)_  
  **Deps:** Task 3.2.  
  **Acceptance:**
  - Reordering components within a slot persists across saves and shows in the view route.

---

## Phase 4 – Inline Editing & UX Polishing

- [ ] **Task 4.1 – Inline text editing for text-based props**  
  **Description:** Introduce inline text editing for `StatusHeader.title`, `StatusHeader.subtitle`, `StatusCard.description`, and `TextBlock.text`. Ensure that the persisted JSON remains plain strings.  
  **Owner:** _(TBD)_  
  **Deps:** Task 2.2.  
  **Acceptance:**
  - Editing text directly on the page updates `PageData.props` strings.
  - Saved changes appear correctly in both edit and view routes.

- [ ] **Task 4.2 – Selection overlay and interactive regions**  
  **Description:** Implement a selection/overlay mechanism in the editor and establish a pattern to exempt specific child elements from overlay hit-testing (so they can remain interactive if needed).  
  **Owner:** _(TBD)_  
  **Deps:** Task 2.2.  
  **Acceptance:**
  - Selected components are clearly highlighted.
  - Interactive elements (if introduced later) can still respond to clicks in edit mode.

---

## Phase 5 – NFRs / Hardening

- [ ] **Task 5.1 [P] – API contract and error-handling tests**  
  **Description:** Expand automated tests to cover API edge cases, including invalid payloads, auth errors, and concurrent updates.  
  **Owner:** _(TBD)_  
  **Deps:** Tasks 1.1, 2.1.  
  **Acceptance:**
  - All documented API scenarios in the plan have corresponding tests.

- [ ] **Task 5.2 [P] – Performance sanity checks**  
  **Description:** Measure page load time for `/status/:slug` and editor responsiveness for representative page sizes. Address low-hanging performance issues.  
  **Owner:** _(TBD)_  
  **Deps:** Phases 1–4.  
  **Acceptance:**
  - Metrics show the system meets agreed latency targets, or remediation tasks are created.

- [ ] **Task 5.3 [P] – Migration strategy for existing pages (if needed)**  
  **Description:** If there are legacy status pages, design and (optionally) implement a migration to the new `PageData` format, including a backfill script and verification steps.  
  **Owner:** _(TBD)_  
  **Deps:** Phase 0 complete; knowledge of legacy format.  
  **Acceptance:**
  - Legacy pages can be converted and verified to render correctly under the new model.



## Session Closeout — Verified Completed Items (recorded)
- Agent/runtime config: idse_developer_agent.py now uses `gpt-5-mini` with `max_output_tokens=400`.
- CLI safety: agency.py wraps LLM calls in a 60s timeout and truncates replies (~1200 chars).
- Backend streaming guard: copilot_adapter.py streams chunked responses (~80-char chunks), caps response length, and times out at 60s.
- Guardrail fix: instruction_protection.py handles list/dict inputs safely without crashing.
- UI changes: StatusBrowserRowWidget.tsx made self-contained; removed external trigger variants from config.tsx.
- Page storage: simplified page JSON (new.json) stored under `data/puck_pages`.
- Routing: public pages available at `/<slug>`; editor copy-link uses `/<slug>`; homepage slug `index` mapped to `/`.
- Styling: PuckEditor.tsx sidebar set to visible slate colors; Pagedone CSS imports applied in main.tsx.
- Builds & smoke tests: frontend builds cleanly; backend served built pages were tested and verified locally.

Notes:
- These items are recorded as "Verified Completed" based on the developer's summary. If you want individual task checklist boxes updated in-place (phase/task level), I can propose an edit to mark those specific tasks done; confirm if you want me to modify the original checklist entries.
