# Implementation Scaffold – Project_Status_Browser Visual Page Editor & Renderer

Source tasks: `/tasks/projects/Project_Status_Browser/sessions/session-1765832163/tasks.md`

This scaffold turns the specification and implementation plan into actionable engineering steps for this session. It also records the key research finding that unblocked the project: adopting a **JSON-backed page model** and a dedicated `/status/:slug/edit` route pattern inspired by the Puck editor.

---

## 1. Architecture Summary (Applied)

The system will:

- Store each status page as a **JSON `PageData` document** in `status_pages.data`.
- Expose a **view route** `/status/:slug` that:
  - Fetches `PageData` via `GET /api/status-pages/:slug`.
  - Renders it through `StatusPageRenderer` and a component registry.
- Expose an **edit route** `/status/:slug/edit` that:
  - Requires auth.
  - Fetches `PageData` via the same GET endpoint.
  - Uses `StatusPageEditor` to modify the in-memory component tree.
  - Saves via `PUT /api/status-pages/:slug` with the full updated `PageData`.

This architecture directly addresses prior difficulties with saving and loading pages by:

- Eliminating separate “editor format” vs “view format”.
- Making the `/edit` route the only place where mutations occur.
- Using a single, well-defined JSON schema for persistence and rendering.

---

## 2. Components (Concretized)

Implementation in the application codebase SHOULD include the following modules (filenames are suggestions):

| Component / File                                                               | Responsibility                                                                                          |
|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `src/features/statusPages/model/types.ts`                                     | Define `PageData` and `ComponentData` TypeScript types.                                               |
| `src/features/statusPages/model/pageSchema.ts`                                | JSON schema for validating `PageData` at the API boundary.                                           |
| `src/features/statusPages/api/statusPageRepository.ts`                        | DB/ORM access for `status_pages` table/collection.                                                    |
| `src/features/statusPages/api/statusPageHandlers.ts`                          | Implement `GET/PUT /api/status-pages/:slug` (and optional POST/DELETE).                              |
| `src/features/statusPages/config/componentRegistry.ts`                        | Map `type` → React component renderer.                                                                |
| `src/features/statusPages/components/StatusPageRenderer.tsx`                  | Walk `PageData` tree and render via registry.                                                         |
| `src/features/statusPages/components/StatusPageEditor.tsx`                    | Visual editor shell: load, maintain, and save `PageData`.                                            |
| `src/features/statusPages/components/editor/EditorCanvas.tsx`                 | Visual canvas for displaying and selecting components.                                               |
| `src/features/statusPages/components/editor/ComponentPalette.tsx`             | Palette of available components (e.g., `StatusCard`, `GridLayout`).                                  |
| `src/features/statusPages/components/editor/PropertyPanel.tsx`                | Sidebar for editing props of the selected component.                                                 |
| `src/features/statusPages/components/layouts/DashboardLayout.tsx`             | Layout component implementing `header`, `body`, `footer` slots.                                      |
| `src/features/statusPages/components/layouts/GridLayout.tsx`                  | Layout component implementing `items` slot with `columns`, `gap`.                                    |
| `src/features/statusPages/components/layouts/ColumnLayout.tsx`                | Layout component implementing `left` and `right` slots with `ratio` prop.                            |
| `src/features/statusPages/components/blocks/StatusHeader.tsx`                 | Leaf component for page headers.                                                                     |
| `src/features/statusPages/components/blocks/StatusCard.tsx`                   | Leaf component for individual status cards.                                                           |
| `src/features/statusPages/components/blocks/TextBlock.tsx`                    | Leaf component for simple text content.                                                               |
| `src/features/statusPages/routing/StatusPageViewRoute.tsx` (or Next.js pages) | Wire `/status/:slug` to `StatusPageRenderer` and API client.                                         |
| `src/features/statusPages/routing/StatusPageEditRoute.tsx`                    | Wire `/status/:slug/edit` to `StatusPageEditor` with auth guard.                                     |

---

## 3. Data Model (Applied)

Follow the spec’s `PageData`/`ComponentData` model:

- `PageData`:
  - `id: string` – UUID.
  - `slug: string` – used in routes.
  - `title: string` – display title.
  - `schemaVersion: number` – for future migrations.
  - `root: ComponentData` – root node of the component tree.

- `ComponentData`:
  - `id: string` – unique within the page.
  - `type: string` – one of: `DashboardLayout`, `GridLayout`, `ColumnLayout`, `StatusHeader`, `StatusCard`, `TextBlock` (initial set).
  - `props: object` – component props and slot fields.

Slot conventions (all arrays of `ComponentData`):

- `DashboardLayout.props.header`, `body`, `footer`.
- `GridLayout.props.items` (plus scalar `columns`, `gap`).
- `ColumnLayout.props.left`, `right` (plus scalar `ratio`).

The backend stores `PageData` in `status_pages.data` and uses `schema_version` to track the version in storage.

---

## 4. API Contracts (Applied)

Implementation MUST align with the plan’s API contracts:

- `GET /api/status-pages/:slug`
  - Returns `{ page: PageData }` or 404.
- `PUT /api/status-pages/:slug`
  - Accepts `{ page: PageData }`.
  - Validates against JSON schema.
  - Persists the entire document atomically.
  - Returns `{ page: PageData }` on success.

Optional in this session but recommended to design for:

- `POST /api/status-pages` for page creation.
- `DELETE /api/status-pages/:slug` for deletion.

The `/status/:slug` and `/status/:slug/edit` frontend routes MUST call these APIs and avoid any alternate persistence paths.

---

## 5. Test Strategy (Session Focus)

During this session, focus on building:

1. **Unit tests** for:
   - JSON schema validation helper(s).
   - `StatusPageRepository` CRUD behavior.

2. **Contract tests** for:
   - `GET /api/status-pages/:slug` (200, 404).
   - `PUT /api/status-pages/:slug` (200 for valid payload, 400 for invalid).

3. A minimal **end-to-end check**:
   - Use a test page JSON.
   - Save via PUT.
   - Fetch via GET.
   - Render via `StatusPageRenderer` in a dev or test route.

Later phases will expand this to full E2E browser tests.

---

## 6. Phases (Implementation View)

The phases below mirror the plan but emphasize concrete coding steps.

### Phase 0 – Foundations

- Implement `PageData` and `ComponentData` types.
- Implement JSON schema and integrate it into backend validation.
- Add `status_pages` storage and `StatusPageRepository`.

### Phase 1 – View Route & Renderer

- Implement `GET /api/status-pages/:slug`.
- Implement `componentRegistry` and `StatusPageRenderer` with basic components.
- Implement `/status/:slug` route and verify sample rendering.

### Phase 2 – Editor & Save/Load

- Implement `PUT /api/status-pages/:slug`.
- Implement `StatusPageEditor` shell with load, in-memory editing, and Save.
- Implement `/status/:slug/edit` route with auth guard.

### Phase 3 – Layout & Slots

- Implement `GridLayout` and `ColumnLayout` components and wire them into the registry and renderer.
- Extend the editor to support adding/removing/reordering components inside slots.

### Phase 4 – Inline Editing & UX

- Add inline text editing for key text props.
- Add selection overlay and patterns for interactive regions.

### Phase 5 – Hardening

- Expand automated tests, performance checks, and (if needed) migration tooling.

---

## 7. Notes on Prior Difficulties and Research Impact

The project previously struggled with **saving and loading pages** reliably, largely due to:

- Ambiguous page representations (no single JSON schema).
- Tight coupling between the editor’s internal state and the view layer.
- Lack of a dedicated `/edit` route and clear save/publish semantics.

The research into the Puck editor provided a proven pattern:

- Use a JSON `PageData` model as the sole persisted format.
- Separate view (`/status/:slug`) and edit (`/status/:slug/edit`) routes.
- Have the editor publish the **entire page JSON** via a single callback (like Puck’s `onPublish(data)`), implemented here as `PUT /api/status-pages/:slug`.

This scaffold encodes that pattern into the architecture and tasks so that future work remains aligned and avoids reintroducing the previous save/load issues.
