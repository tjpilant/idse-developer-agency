# Implementation Plan – Project_Status_Browser Visual Page Editor & Renderer

Source spec: `/specs/projects/Project_Status_Browser/sessions/session-1765832163/spec.md`

This plan translates the specification into a concrete, phased implementation approach. It integrates the research findings around JSON-backed pages, slot-based layouts, and the `/status/:slug` vs `/status/:slug/edit` route pattern.

---

## 1. Architecture Summary

### 1.1 High-Level Components

1. **Status Page API Layer**
   - REST endpoints for status pages:
     - `GET /api/status-pages/:slug` → returns `{ page: PageData }`.
     - `PUT /api/status-pages/:slug` → accepts `{ page: PageData }` and persists it.
     - (Optional) `POST /api/status-pages`, `DELETE /api/status-pages/:slug`.
   - Responsible for validation, persistence, and enforcing auth.

2. **Persistence Layer**
   - `status_pages` storage (e.g., DB table):
     - `id`, `slug`, `title`, `schema_version`, `data` (JSON), timestamps.
   - Repository abstraction used by the API layer.

3. **StatusPageRenderer (View-only)**
   - Frontend component that:
     - Accepts `PageData`.
     - Walks the `ComponentData` tree.
     - Uses a **component registry** to render each node type.
   - Used in the `/status/:slug` route.

4. **StatusPageEditor (Visual Editor)**
   - Frontend component used at `/status/:slug/edit`.
   - Responsibilities:
     - Load `PageData` via API on mount.
     - Maintain an in-memory representation of the component tree.
     - Support add/remove/reorder of components and props editing.
     - On Save: PUT the updated `PageData` back to the API.
   - Optionally provides inline text editing and a preview using the renderer.

5. **Component Registry & Layout/Block Components**
   - A central registry mapping `type: string` → React component.
   - Layout components (`DashboardLayout`, `GridLayout`, `ColumnLayout`) implement slots.
   - Block components (`StatusHeader`, `StatusCard`, `TextBlock`) implement leaf nodes.

6. **Routing Layer**
   - View route: `/status/:slug` → fetch via API → `StatusPageRenderer`.
   - Edit route: `/status/:slug/edit` → auth → fetch via API → `StatusPageEditor`.

---

## 2. Components

| Component / Module                             | Responsibility                                                                                  | Interfaces / Dependencies                                      |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `StatusPageRepository`                        | CRUD operations for `status_pages` storage                                                      | DB client/ORM, JSON serialization                              |
| `StatusPageApiController` / handlers          | HTTP handlers for `GET/PUT(/POST/DELETE) /api/status-pages`                                     | Repository, JSON schema validation, auth middleware            |
| `PageData` / `ComponentData` types           | Type and schema definitions for page and components                                             | Used by API, editor, renderer                                  |
| `StatusPageRenderer`                          | Walks `PageData` tree and renders via registry                                                  | Component registry, React                                      |
| `StatusPageEditor`                            | Visual editor; manages in-memory tree and save operations                                      | API client, `PageData` types, editor subcomponents             |
| `componentRegistry`                           | Maps `type` to React component renderers                                                       | Layout and block components                                    |
| `DashboardLayout`, `GridLayout`, `ColumnLayout` | Layout components that expose slots via props                                                  | Renderer, editor, `ComponentData`                             |
| `StatusHeader`, `StatusCard`, `TextBlock`     | Leaf components containing display data                                                         | Renderer, editor (property editing), inline text field         |
| `EditorCanvas`                                | Visual tree / canvas for arranging components                                                   | `StatusPageEditor`, drag-and-drop library (if used)            |
| `ComponentPalette`                            | UI listing available component types for insertion                                              | `StatusPageEditor`                                             |
| `PropertyPanel`                               | Sidebar for editing selected component props                                                    | `StatusPageEditor`, `ComponentData`                            |

---

## 3. Data Model

### 3.1 Database Schema (example)

SQL-style table (adapt as needed):

```sql
CREATE TABLE status_pages (
  id            UUID PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  schema_version INT NOT NULL DEFAULT 1,
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- `data` stores the `PageData` JSON (as specified in spec.md).
- `schema_version` mirrors `schemaVersion` in JSON and supports migrations.

### 3.2 JSON Model Recap

- `PageData`:
  - `id: string` (UUID)
  - `slug: string`
  - `title: string`
  - `schemaVersion: number`
  - `root: ComponentData`

- `ComponentData`:
  - `id: string`
  - `type: string` (e.g., `DashboardLayout`, `StatusCard`)
  - `props: object`

- Slot conventions (all arrays of `ComponentData`):
  - `DashboardLayout.props`: `header`, `body`, `footer`
  - `GridLayout.props`: `items`, plus scalar `columns`, `gap`
  - `ColumnLayout.props`: `left`, `right`, plus scalar `ratio`

---

## 4. API Contracts

### 4.1 GET /api/status-pages/:slug

- **Description:** Fetch a status page by slug.
- **Method:** GET
- **Path:** `/api/status-pages/:slug`
- **Request:**
  - URL params: `slug` (string)
  - Auth: optional for read, depending on environment/policy.
- **Responses:**
  - `200 OK` – `{"page": PageData}`
  - `404 Not Found` – page does not exist.
  - `401/403` – if reads require auth and the caller is unauthorized.

### 4.2 PUT /api/status-pages/:slug

- **Description:** Replace the JSON definition of a status page.
- **Method:** PUT
- **Path:** `/api/status-pages/:slug`
- **Request:**
  - URL params: `slug` (string)
  - Body: `{ "page": PageData }`
  - Auth: required; only authorized editors may update.
- **Behavior:**
  - Validate request body against `PageData` schema.
  - Ensure `page.slug` matches `:slug` or normalize appropriately.
  - Persist the new JSON atomically.
- **Responses:**
  - `200 OK` – `{"page": PageData}` with persisted data.
  - `400 Bad Request` – invalid JSON or schema violation.
  - `401/403` – unauthorized.
  - `409 Conflict` – optional, if optimistic locking is introduced later.

### 4.3 (Optional) POST /api/status-pages

- **Description:** Create a new status page.
- **Method:** POST
- **Path:** `/api/status-pages`
- **Request:**
  - Body: `{ "page": Omit<PageData, "id"> }` OR `{ title, slug, initialPage }`.
- **Responses:**
  - `201 Created` – `{"page": PageData}` with assigned `id`.

### 4.4 (Optional) DELETE /api/status-pages/:slug

- **Description:** Delete a status page.
- **Method:** DELETE
- **Path:** `/api/status-pages/:slug`
- **Responses:**
  - `200 OK` – `{ "deleted": true }`.
  - `404 Not Found` – page not found.

---

## 5. Test Strategy

The test strategy is designed to ensure the new JSON-backed editor and save/load mechanisms are reliable and regressions are caught early.

### 5.1 Unit Tests

- **Targets:**
  - JSON schema validation helpers.
  - Repository functions for `status_pages` table.
  - Component registry lookups.
  - Small utilities used by the editor (e.g., tree manipulation helpers for add/remove/reorder).

- **Tools:** Jest / Vitest / similar.

### 5.2 Contract Tests (API)

- Validate `GET /api/status-pages/:slug` and `PUT /api/status-pages/:slug` against example payloads.
- Test:
  - Successful round-trips with valid `PageData`.
  - Rejection of invalid JSON (missing `root`, invalid `schemaVersion`, incorrect slot types).
  - Auth behavior for edit endpoints.

### 5.3 Integration Tests

- Stand up the API with a test DB.
- Exercise flows:
  - Create a page (if `POST` is implemented) → fetch → update → fetch.
  - Migration handling if schemaVersion changes (future work).

### 5.4 End-to-End (E2E) Tests

- Use Cypress/Playwright or equivalent to verify:
  - Visiting `/status/:slug` renders the correct components and layout.
  - Visiting `/status/:slug/edit`, performing edits, saving, and then reloading `/status/:slug` reflects changes.
  - Unauthorized users cannot access `/status/:slug/edit` or mutate via API.

### 5.5 Performance & Resilience

- Benchmarks for typical page sizes (e.g., 20, 50, 100 components) to validate:
  - View route render times.
  - Editor responsiveness for add/remove/reorder operations.

---

## 6. Phases & Milestones

### Phase 0 – Foundations (Data Model & Storage)

1. **Define TypeScript types and JSON schema** for `PageData` and `ComponentData`.
2. **Add `status_pages` storage**:
   - Migrations for DB table (or equivalent for chosen storage).
   - Implement `StatusPageRepository` with basic CRUD.
3. **Establish validation pipeline**:
   - Integrate a JSON schema validator (e.g., Ajv) for incoming `PageData`.

**Exit criteria:**

- A simple `PageData` can be validated and saved/loaded through the repository layer in tests.

### Phase 1 – Core Behavior (View Route & Renderer)

1. Implement `GET /api/status-pages/:slug` using `StatusPageRepository`.
2. Implement `StatusPageRenderer` and `componentRegistry` with at least:
   - `DashboardLayout`, `StatusHeader`, `StatusCard`, `TextBlock`.
3. Implement `/status/:slug` view route in the frontend that:
   - Fetches `PageData` from the API.
   - Renders it via `StatusPageRenderer`.

**Exit criteria:**

- A sample page defined in JSON can be manually inserted into storage and rendered correctly at `/status/sample-slug`.

### Phase 2 – Editor & Save/Load

1. Implement `PUT /api/status-pages/:slug` with full validation.
2. Build `StatusPageEditor` component:
   - Load `PageData` via GET.
   - Maintain in-memory tree state.
   - Provide basic UI for selecting a component and editing its scalar props.
   - Provide a Save button that PUTs updated `PageData`.
3. Implement `/status/:slug/edit` route (with auth guard) wired to `StatusPageEditor`.

**Exit criteria:**

- A user can:
  - Open `/status/:slug/edit`,
  - Change a header/title and a card description,
  - Save,
  - See the changes at `/status/:slug` and after reloading `/status/:slug/edit`.

### Phase 3 – Layout & Slots

1. Extend `componentRegistry` and renderer to support:
   - `GridLayout` with `columns`, `gap`, and `items` slot.
   - `ColumnLayout` with `left`, `right`, and `ratio` props.
2. Extend the editor to support:
   - Adding/removing child components within specific slots.
   - Reordering within a slot (drag & drop or controls).
3. Ensure JSON round-tripping for nested layouts.

**Exit criteria:**

- A nested layout page (DashboardLayout → GridLayout → StatusCards) can be created/edited via the editor and rendered correctly.

### Phase 4 – Inline Editing & UX Polishing

1. Introduce inline text editing for `StatusHeader`, `StatusCard`, and `TextBlock` text props.
2. Implement an overlay/selection layer with a mechanism to keep specific subtrees interactive.
3. Polish editor UX (undo/redo optional, but at least basic confirmation on navigation away with unsaved changes).

**Exit criteria:**

- Editing text directly on the page works reliably and persists.
- No regressions in view vs edit behavior.

### Phase 5 – NFRs & Hardening

1. Add more exhaustive tests (load, security, failure modes).
2. Instrument logging and monitoring for save/load operations.
3. Address performance hotspots identified in profiling.
4. Prepare migration strategy for existing status pages, if applicable.

**Exit criteria:**

- API and editor meet agreed performance and reliability targets.
- The system is ready for broader adoption within the project portfolio.
