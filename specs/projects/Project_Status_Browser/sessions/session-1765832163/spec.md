# Specification – Project_Status_Browser Visual Page Editor & Renderer

Intent source: `/intents/projects/Project_Status_Browser/sessions/session-1765832163/intent.md`  
Context source: `/contexts/projects/Project_Status_Browser/sessions/session-1765832163/context.md`

---

## 1. Overview & Background

The Project_Status_Browser previously had difficulty **reliably saving and loading status pages**. Page representations were not clearly separated between the editing surface and the public view, which led to ad‑hoc formats and fragile mappings.

This specification formalizes a new model based on:

- A **single JSON page data model** as the source of truth.
- A clear separation of routes:
  - `/status/:slug` – read-only view route.
  - `/status/:slug/edit` – authenticated edit route.
- A **component-driven editor** that operates directly on the same JSON as the renderer.
- **Slot-based layout components** (inspired by Puck’s Slots API) for nesting components.
- Optional **inline text editing** and editor overlay behavior.

External research from the Puck editor (https://puckeditor.com/blog) strongly influenced this design, especially patterns for JSON-backed pages, slots, `/edit` routes, and save/publish flows.

This document defines **what** the system must do and **why**, without prescribing specific implementation details.

---

## 2. Users & User Stories

### 2.1 Primary Users

1. **Status Editors / PMs** (non-technical users)
   - Need to create and update project status pages without engineering support.
2. **Viewers / Stakeholders**
   - Need to quickly understand the state of a project via read-only status pages.
3. **Developers**
   - Need a clear, stable data model and APIs for building and maintaining the system.

### 2.2 User Stories

**US-1 – Create a new status page**  
As a status editor, I want to create a new status page composed of reusable components (headers, cards, grids, text blocks), so that I can communicate project health without writing code.

**US-2 – Edit an existing status page visually**  
As a status editor, I want to open an existing status page in an editor at `/status/:slug/edit` and visually add, remove, and rearrange components, so that I can keep the page up to date.

**US-3 – Save and reload a page reliably**  
As a status editor, when I save changes in the editor, I want those changes to persist and be visible the next time I open both `/status/:slug` and `/status/:slug/edit`, so that I trust the tool and do not lose work.

**US-4 – Use nested layouts (slots)**  
As a status editor, I want to organize content into regions (e.g., header, body, footer, grid cells, columns), so that complex dashboards remain understandable.

**US-5 – Inline edit important text**  
As a status editor, I want to edit key text (titles, descriptions) directly on the page canvas, so that editing feels natural and I see changes in context.

**US-6 – View a status page**  
As a viewer, I want to visit `/status/:slug` and see a rendered status page with its components and layout, without any editing UI, so that I can quickly understand project status.

**US-7 – Prevent unauthorized editing**  
As an administrator, I want `/status/:slug/edit` and the save APIs to require authentication and authorization, so that only approved users can change status pages.

---

## 3. Functional Requirements

### 3.1 Page Data Model

**FR-1 – Single JSON source of truth**  
The system SHALL represent each status page as a JSON document (`PageData`) that is the single source of truth for both the editor and the renderer.

**FR-2 – Component tree structure**  
The page JSON SHALL contain a tree of components, where each node has:

- `id: string` – unique within the page.
- `type: string` – the component type key (e.g., `DashboardLayout`, `StatusCard`).
- `props: object` – component props, including any nested slots.

**FR-3 – Slot fields as arrays**  
Any field in `props` that represents a layout region or slot (e.g., `header`, `body`, `footer`, `items`, `columns`, `left`, `right`) SHALL be an array of `ComponentData` (0 or more elements).

**FR-4 – Schema versioning**  
The page JSON SHALL include a `schemaVersion: number` field to allow future migrations.

### 3.2 Routing & Save/Load Behavior

**FR-5 – View route**  
The system SHALL provide a read-only view route:

- Path: `/status/:slug`
- Behavior:
  - Fetches the page’s `PageData` JSON from the backend via `GET /api/status-pages/:slug`.
  - Renders the page using a shared component registry and a renderer.
  - Does not expose any editing controls and does not mutate data.

**FR-6 – Edit route**  
The system SHALL provide an edit route:

- Path: `/status/:slug/edit`
- Behavior:
  - Requires authentication and proper authorization.
  - Fetches the same `PageData` JSON via `GET /api/status-pages/:slug`.
  - Displays a visual editor that:
    - Shows the component tree as a page preview.
    - Allows adding/removing/reordering components and modifying props.
  - On Save/Publish:
    - Sends the full, updated `PageData` document to `PUT /api/status-pages/:slug`.

**FR-7 – Editor/view consistency**  
Changes made in `/status/:slug/edit` and saved via the API SHALL be reflected exactly in `/status/:slug` after persistence, with no additional transformations required.

### 3.3 Component & Slot Behavior

**FR-8 – Supported component types (initial set)**  
The system SHALL support at least the following component types in v1:

- `DashboardLayout` – root-level layout with `header`, `body`, and `footer` slots.
- `GridLayout` – grid layout with `columns`, `gap`, and `items` slot.
- `ColumnLayout` – two-column layout with `left` and `right` slots.
- `StatusHeader` – non-slot component showing title and optional subtitle.
- `StatusCard` – non-slot component representing a status block (title, status, description).
- `TextBlock` – non-slot text component.

**FR-9 – DashboardLayout slots**  
`DashboardLayout.props` SHALL support:

- `header: ComponentData[]`
- `body: ComponentData[]`
- `footer: ComponentData[]`

**FR-10 – GridLayout slots and props**  
`GridLayout.props` SHALL support:

- `columns: number` – the number of columns.
- `gap: number` – spacing between grid items.
- `items: ComponentData[]` – child components rendered inside the grid.

**FR-11 – ColumnLayout slots and props**  
`ColumnLayout.props` SHALL support:

- `left: ComponentData[]`
- `right: ComponentData[]`
- `ratio: [number, number]` (optional) – relative column widths.

**FR-12 – Non-slot components**  
`StatusHeader`, `StatusCard`, and `TextBlock` SHALL not define slots in v1; they SHALL use only scalar props:

- `StatusHeader.props`: `title: string`, `subtitle?: string`.
- `StatusCard.props`: `title: string`, `status: string`, `description?: string`.
- `TextBlock.props`: `text: string`.

### 3.4 Editing UX

**FR-13 – Visual editor operations**  
The visual editor at `/status/:slug/edit` SHALL support at least:

- Adding a new component of any supported type to an allowed slot.
- Removing an existing component.
- Reordering components within a slot (drag & drop or move buttons).
- Selecting a component to edit its props.

**FR-14 – Inline editing for text**  
For text-based props (e.g., `StatusHeader.title`, `StatusCard.description`, `TextBlock.text`), the editor SHOULD support inline editing directly on the canvas. When inline editing is enabled for a field, the system SHALL ensure that the stored JSON remains a string (i.e., no React nodes in serialized data).

**FR-15 – Editor overlay and interaction**  
The editor SHALL use some form of overlay or visual selection mechanism to indicate the currently selected component. Where interactive child elements are present (e.g., expandable sections), the editor SHALL provide a way to keep those elements clickable while still tracking selection (e.g., by exempting their DOM nodes from overlay hit-testing).

### 3.5 Persistence & API

**FR-16 – Get status page API**  
The backend SHALL expose:

- `GET /api/status-pages/:slug`
- Response: `{ page: PageData }`.
- Behavior: returns HTTP 404 if the page does not exist.

**FR-17 – Update status page API**  
The backend SHALL expose:

- `PUT /api/status-pages/:slug`
- Request body: `{ page: PageData }`.
- Behavior:
  - Validates that the incoming JSON conforms to the `PageData` schema.
  - Replaces the stored JSON for that `slug` atomically.
  - Returns `{ page: PageData }` with the persisted value.

**FR-18 – Create/delete status pages (optional in v1)**  
The backend MAY expose `POST /api/status-pages` and `DELETE /api/status-pages/:slug` for page lifecycle management. If present, they SHALL follow analogous JSON contracts.

---

## 4. Data Model Specification (JSON Schema Level)

This section describes the logical schema. Implementation MAY use JSON Schema (e.g., Ajv) or equivalent validation.

### 4.1 PageData

```jsonc
{
  "id": "<uuid>",
  "slug": "project-foo-status",
  "title": "Project Foo – Status",
  "schemaVersion": 1,
  "root": { /* ComponentData */ }
}
```

Constraints:

- `id`: required, UUID string.
- `slug`: required, URL-safe, pattern `^[a-z0-9-]+$`.
- `title`: required, non-empty string.
- `schemaVersion`: required, integer ≥ 1.
- `root`: required, valid `ComponentData` node.

### 4.2 ComponentData

```jsonc
{
  "id": "StatusCard-1",
  "type": "StatusCard",
  "props": {
    "title": "Backend",
    "status": "OK",
    "description": "All systems operational"
  }
}
```

Constraints:

- `id`: required, unique within the page.
- `type`: required, MUST be one of the known component type keys for this version.
- `props`: required object.
  - Slot fields: MUST be arrays of `ComponentData`.
  - Non-slot fields: MUST be serializable JSON values (string, number, boolean, null, or shallow object/array of these).

### 4.3 Slot Conventions

- ANY slot field is represented as:

  ```jsonc
  "slotName": [ /* ComponentData[] */ ]
  ```

- Common slot names and meanings:

  - `header`: components rendered at the top of a dashboard/page.
  - `body`: main content region.
  - `footer`: bottom region.
  - `items`: generic list items (e.g., grid cells).
  - `columns`: list of column layouts.
  - `left` / `right`: content in left/right columns.

- There are no “single element” slots; even if a slot typically has one child, it is always an array in JSON.

---

## 5. Non-Functional Requirements

**NFR-1 – Performance**  
- Typical pages (tens to low-hundreds of components) SHOULD load and render in < 2s p95 on the view route under expected network conditions.
- Editor operations (add/remove/reorder, text edits) SHOULD feel responsive, with UI updates in < 200ms for direct interactions.

**NFR-2 – Reliability & Integrity**  
- Save operations MUST be atomic at the page level (either the entire JSON is persisted or not at all).
- The system MUST never persist partially invalid JSON (schema validation fails the request with 4xx).

**NFR-3 – Security**  
- `/status/:slug` MAY be public (read-only), depending on organization policy.
- `/status/:slug/edit` and all mutation endpoints (`PUT`, `POST`, `DELETE`) MUST require authentication and appropriate authorization.
- Input data MUST be validated server-side before persistence.

**NFR-4 – Evolvability**  
- `schemaVersion` MUST be stored with each page, and migrations MUST be defined when schema semantics change.
- Component types and props SHOULD be versioned in a way that allows gradual deprecation.

---

## 6. Acceptance Criteria

**AC-1 – Basic create/edit/view**  
Given a new status page is created and saved via the editor at `/status/new-page/edit`,  
when the user visits `/status/new-page`,  
then the content and layout SHALL match the last saved state exactly.

**AC-2 – Nested layout round-trip**  
Given a page with a `DashboardLayout` root and a `GridLayout` with two `StatusCard` children nested under `body`,  
when the user saves the page, reloads `/status/:slug/edit`, and then visits `/status/:slug`,  
then the JSON representation SHALL contain a `root.props.body[0]` of type `GridLayout` whose `props.items` array lists the same two cards in order, and the rendered output SHALL reflect that layout.

**AC-3 – Editor/view consistency**  
Given a user edits the text of a `StatusHeader.title` inline in the editor and clicks Save,  
when the user reloads `/status/:slug` and `/status/:slug/edit`,  
then both routes SHALL show the updated title.

**AC-4 – Invalid data rejection**  
Given a client attempts to `PUT /api/status-pages/:slug` with JSON that does not conform to the `PageData` schema (e.g., missing `root`, invalid `schemaVersion`),  
then the server SHALL respond with an appropriate 4xx error and SHALL NOT modify the stored page.

**AC-5 – Unauthorized edit protection**  
Given an unauthenticated or unauthorized user attempts to access `/status/:slug/edit` or call `PUT /api/status-pages/:slug`,  
then the request SHALL be rejected with an appropriate 4xx/5xx error code and no changes SHALL be made.

---

## 7. Assumptions, Constraints, Dependencies

**Assumptions**

- The host application uses React or a similar component-based UI framework.
- A database or equivalent storage exists (e.g., Postgres with JSONB, or a document store) to persist `PageData` payloads.
- Client-side routing and server-side APIs can be updated to add `/status/:slug` and `/status/:slug/edit` routes.

**Constraints**

- Must remain self-hosted; no external SaaS page-builder dependencies.
- Must conform to the IDSE constitution: stages Intent → Context → Spec → Plan → Tasks → Implementation → Feedback are followed, and governance logic is kept separate from application code.
- The JSON model must be serializable and not embed runtime-specific constructs (e.g., React components) in persisted data.

**Dependencies**

- Authn/authz system to guard `/edit` routes and mutation APIs.
- Logging/monitoring to detect failures in save/load operations.

---

## 8. Open Questions

- **OQ-1 – Page lifecycle:** Should this iteration include UI for creating/deleting status pages, or are pages provisioned by another system?
- **OQ-2 – Draft vs published:** Do we need separate draft/published states per page now, or can we treat every save as immediately published?
- **OQ-3 – Version history:** Is version history required in the near term (e.g., revert to previous versions), or can this be deferred?
- **OQ-4 – Component catalog:** Is the initial set of components (`DashboardLayout`, `GridLayout`, `ColumnLayout`, `StatusHeader`, `StatusCard`, `TextBlock`) sufficient for the team’s expected use cases, or are additional specialized blocks needed (e.g., timelines, incident lists)?
