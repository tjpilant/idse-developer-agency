# Test Plan – Project_Status_Browser Visual Page Editor & Renderer

Source spec: `/specs/projects/Project_Status_Browser/sessions/session-1765832163/spec.md`

This test plan makes the requirements for the JSON-backed status page editor and renderer verifiable. It incorporates the specific issues we’ve seen so far: incomplete Puck data migration, save/load and slug overwrites, and cramped one-column rendering of the Status Browser widget.

---

## 1. Overview

### 1.1 Goal

Verify that Project_Status_Browser can:

- Represent status pages as JSON `PageData` documents.
- Load and save pages reliably via the backend without duplicating or corrupting records (no slug overwrites).
- Render pages consistently in both view (`/status/:slug`) and edit (`/status/:slug/edit`) modes.
- Properly migrate legacy Puck data (zones, old root props, DropZone data) into the new slot-based format.
- Render and edit the Status Browser widget/layout correctly as a multi-slot, multi-column widget.

### 1.2 In Scope

- `PageData` / `ComponentData` model and JSON validation.
- `status_pages` storage and the `StatusPageRepository`.
- API endpoints:
  - `GET /api/status-pages/:id` or `/:slug` (depending on canonical ID choice).
  - `POST /api/status-pages` (create).
  - `PUT /api/status-pages/:id` or `/:slug` (update).
- Puck editor integration (`StatusPageEditor` + Puck/Puck-like configs).
- Renderer (`StatusPageRenderer` or equivalent wrapper around Puck Render).
- Legacy data normalization / migration logic:
  - Stripping `zones`.
  - Mapping legacy zones → new slot props (e.g., FourColumnLayout and Status Browser widget).
- Status Browser widget layout (menu trigger slot + selector + status content slots).

### 1.3 Out of Scope (for this iteration)

- Full version history UI (rollback across historical versions).
- Real-time collaborative editing.
- Cross-project analytics and dashboards that consume status pages.

---

## 2. Test Objectives

1. **Data Model Integrity**  
   Ensure that all persisted `PageData` documents conform to the schema, and that migrations convert legacy Puck data (zones, old DropZone fields, root props) into slot-based props without data loss.

2. **Save/Load & Slug Stability**  
   Verify that:
   - First save of a new page creates a single record.
   - Subsequent saves update that record **without creating duplicates or changing the slug**.
   - Slug is exposed at the root of `PageData` and remains stable unless explicitly changed via a deliberate operation.

3. **View vs Edit Consistency**  
   Confirm that `/status/:slug` and `/status/:slug/edit` render the same content and layout after saves.

4. **Legacy Data Migration**  
   Validate that legacy pages containing `zones`, old root props, or DropZone-based structures:
   - Load without runtime errors (e.g., `toString undefined`).
   - Are normalized into slot-based `props` before hitting Puck.
   - Once saved, no longer contain `zones` in storage.

5. **Status Browser Widget Layout**  
   Ensure the Status Browser widget:
   - Renders as a multi-column layout (menu trigger in col1, selector above status content in col2+3), not cramped or single-column.
   - Can be placed anywhere in a page (e.g., in DashboardLayout body) without forcing it into the global left navigation.

6. **Security & Access Control**  
   Verify that:
   - `/status/:slug` behaves as defined (read-only, auth policy as decided).
   - `/status/:slug/edit` and mutation endpoints require authentication and are protected against unauthorized access.

7. **Performance & Robustness**  
   Validate that typical pages (tens to low hundreds of components) load and save within acceptable latency and that the editor remains responsive.

---

## 3. Test Types and Approach

### 3.1 Unit Tests

**Targets:**

- JSON schema validation helpers for `PageData` and `ComponentData`.
- `StatusPageRepository` CRUD operations.
- Normalization / migration helpers (e.g., `normalizePageData`, `migrateLegacyPage`):
  - Stripping `zones`.
  - Mapping legacy FourColumnLayout and StatusBrowserWidget zones into slot props.
  - Normalizing `root.props` arrays for slots.
- Utility functions that manage slug generation and uniqueness on **create** only.

**Approach:**

- Use Jest/Vitest or similar.
- Provide fixtures for:
  - Valid `PageData` (new format).
  - Legacy Puck data with zones and old props.
  - Edge cases (missing root, unknown types, invalid slot shapes).

### 3.2 Contract Tests (API)

**Endpoints:**

- `GET /api/status-pages/:id` or `:slug`.
- `POST /api/status-pages`.
- `PUT /api/status-pages/:id` or `:slug`.

**Objectives:**

- Confirm JSON contracts:
  - `GET` returns `{ page: PageData }` matching the schema.
  - `POST` and `PUT` accept `{ page: PageData }`, enforce schema validation, and return `{ page: PageData }` on success.
- Validate error handling:
  - 400 for invalid schema.
  - 404 for unknown `id`/`slug` on update.
  - 401/403 for unauthorized edits.

**Specific scenarios:**

1. **Create vs Update Distinction**
   - When `page.id` is absent and `POST` is called → a new record is created; slug is generated once.
   - When `page.id` is present and `PUT /api/status-pages/:id` is called → the existing record is updated; slug is not re-slugified.

2. **Slug Stability**
   - Create a page with title `"Project Foo"` → slug `"project-foo"`.
   - Update the page with title changed to `"Project Foo v2"` via `PUT`.
   - Ensure the slug remains `"project-foo"` in DB and responses.

3. **Legacy Data Normalization**
   - POST or PUT an intentionally “legacy-shaped” payload (zones + old root props) through the normalization logic (if tests call that explicitly), and assert that stored data is normalized to the new schema.

### 3.3 Integration Tests

**Targets:**

- End-to-end data flow: DB ↔ API ↔ editor/renderer integration (without full UI automation).

**Scenarios:**

1. **Basic Page Lifecycle**
   - Use the repository to seed a `status_pages` record with a fully valid `PageData`.
   - Call `GET /api/status-pages/:id`.
   - Deserialize in a test harness and render via `StatusPageRenderer` in a test environment; assert DOM shape or snapshot.

2. **Legacy Page Migration**
   - Seed DB with a “legacy” record that includes `zones` and old root props (simulating pre-0.19 Puck data for a layout like FourColumnLayout or StatusBrowserWidget).
   - Call the full load path used by the editor/renderer (including your `normalizePageData` loader).
   - Assert that:
     - There are no runtime errors.
     - The in-memory `PageData` after normalization has no `zones` and contains the expected slot props.
   - Optionally, save the page through the normal save path and confirm DB data is updated to the normalized format.

3. **Save/Load with Slug Stability**
   - Create a new page via `POST`.
   - Fetch it, edit it in a test harness (mutate `PageData`), and `PUT` it back.
   - Verify a second `GET` returns the modified content with the same slug and `id`.

### 3.4 End-to-End (E2E) Tests

Use Cypress/Playwright or similar to simulate actual user behavior in the browser.

**Scenarios:**

1. **Create & View Simple Page**
   - Visit `/status/new/edit` or a dedicated “create” route.
   - Add `StatusHeader` and one `StatusCard` via the editor.
   - Save.
   - Navigate to `/status/<slug>` and verify that:
     - Header and card appear as configured.
     - No console errors appear (`toString undefined`, `defaultProps` warnings, etc.).

2. **Edit Existing Page Without Duplicate Slugs**
   - Start from a page created in test 1.
   - Visit `/status/<slug>/edit`.
   - Make changes (edit text, add another card), then save twice.
   - Verify in DB (or API calls) that:
     - Only one record exists for that slug.
     - Slug has not changed.
   - Verify in UI that the view route reflects the latest changes.

3. **Legacy Page in Editor & View**
   - Seed a legacy page with zones and old props (from a fixture file).
   - Visit `/status/<legacy-slug>/edit`.
   - Confirm that:
     - The page loads without runtime errors.
     - The layout and components appear in a sensible way (as per migration plan).
   - Save the page.
   - Reload `/status/<legacy-slug>` and `/status/<legacy-slug>/edit`.
   - Confirm:
     - No `zones` remain in persisted JSON.
     - Layout and content are preserved.

4. **Status Browser Widget Layout**
   - In the editor, create a page whose body includes a `StatusBrowserWidget`.
   - Place:
     - A menu trigger component in the widget’s `trigger` slot.
     - A project/session selector component in the `selector` slot.
     - One or more status components (e.g., summary cards) in the `status` slot.
   - Verify in the canvas that:
     - Menu trigger appears in the left column.
     - Selector appears above status content in the right area (spanning col2/3).
     - Status content uses the intended multi-column layout (not cramped/one-column).
   - Save and verify `/status/<slug>` shows the same layout.

5. **Auth & Access Control**
   - Attempt to visit `/status/<slug>/edit` without being logged in.
   - Confirm redirect to login or 401/403 error.
   - Log in as an authorized editor and confirm access works.

### 3.5 Performance Tests (Lightweight)

Given the current scope, full load testing may not be necessary, but we should at least:

- Measure time to first render for:
  - A simple page (few components).
  - A "heavy" page (e.g., ~100 components, several nested layouts).
- Measure editor responsiveness for:
  - Adding/removing components.
  - Reordering items inside slots.

If times exceed acceptable UX thresholds, create follow-up optimization tasks.

### 3.6 Security Tests

- Confirm that mutation endpoints (`POST`, `PUT`) reject unauthenticated requests.
- Confirm that invalid or unexpected data structures (e.g., `zones` at the top level submitted directly) are rejected or properly normalized before persistence.
- Static analysis / lint rules to prevent accidental direct DB writes that bypass validation.

---

## 4. Test Environment

- **Languages/Frameworks:**
  - Backend: Node.js (version TBD), Express/Next.js API routes (TBD).
  - Frontend: React (version TBD), Puck 0.19.3+.
- **Databases:**
  - Postgres (preferred) or equivalent, with JSON(B) support for `status_pages.data`.
- **Puck:**
  - Ensure the same Puck version is used in editor and renderer builds.
- **Differences from Production:**
  - In test environments, you may use a separate DB schema or an in-memory database.
  - Feature flags or mocked auth providers may be used.

---

## 5. Test Data

- **PageData Fixtures:**
  - `simple-page.json`: minimal new-format page with a DashboardLayout and a few leaf components.
  - `legacy-page-four-column.json`: legacy Puck data featuring FourColumnLayout with zones and old root props.
  - `status-browser-widget.json`: page featuring the Status Browser widget with various components in its slots.

- **API Payloads:**
  - Valid create and update payloads for `PageData`.
  - Invalid payloads (missing `root`, unknown field types, malformed slots) to exercise validation.

- **Auth Identities:**
  - `editorUser`: authorized to create/edit pages.
  - `viewerUser`: authorized only to view.
  - `anonymous`: no auth.

---

## 6. Success Criteria

- All unit, contract, integration, and E2E tests for this feature pass in CI.
- Typical manual acceptance flows are stable:
  - Create/edit/view flows for new pages.
  - Loading and correcting legacy pages.
- No duplicate page records are created by repeated saves of the same page.
- Slugs remain stable across normal edit cycles.
- No runtime errors (e.g., `toString undefined`, slot/defaultProps warnings) are observed in logs or browser console during standard flows.
- Status Browser widget renders correctly as a slot-based multi-column widget both in the editor and in the view route.

---

## 7. Reporting

- Integrate test runs into CI (e.g., GitHub Actions, GitLab CI, etc.).
- Emit JUnit or similar reports for unit/contract/integration tests; collect Cypress/Playwright reports for E2E.
- On failures, include:
  - The failing spec or scenario.
  - Relevant logs and stack traces.
- Periodically review test coverage around:
  - Migration paths.
  - Save/load flows.
  - Slug stability.
  - Status Browser widget layout.

This test plan should be reviewed whenever the `PageData` schema, routing model, or Status Browser widget design changes. It acts as the quality contract for the spec and plan documents for Project_Status_Browser.