# Feedback – Project_Status_Browser Visual Page Editor & Renderer

Timestamp: 2025-12-17T15:22:01.089663+00:00 (updated)

## Notes

During this session, we moved Project_Status_Browser’s IDSE artifacts from generic scaffolds to **fully realized documents** that encode the Puck-inspired design and address concrete problems the team has been seeing (incomplete migrations, save/load/slug issues, and cramped Status Browser layout):

- **Intent/Context** already captured the desire for a JSON-backed visual editor and explicitly referenced the `/status/:slug` + `/status/:slug/edit` pattern, as well as Puck’s Slots API, inline editing, and save/publish flows.
- **Spec** now defines:
  - The **JSON page model**:
    - `PageData { id, slug, title, schemaVersion, root: ComponentData }`.
    - `ComponentData { id, type, props }`.
  - **Slot-based layouts** and slot conventions:
    - Layouts like `DashboardLayout`, `GridLayout`, `ColumnLayout`, and the `StatusBrowserWidget` all use slots represented as arrays of `ComponentData` (`header`, `body`, `footer`, `items`, `columns`, `left`, `right`, `trigger`, `selector`, `status`).
  - **Routes**:
    - `/status/:slug` – view route (read-only, fetches PageData from backend and renders via renderer/registry).
    - `/status/:slug/edit` – editor route (authenticated, fetches the same PageData and saves via PUT).
  - **APIs**:
    - `GET /api/status-pages/:slug` → `{ page: PageData }`.
    - `PUT /api/status-pages/:id` or `/:slug` → `{ page: PageData }` (update-in-place, no re-slugify).
    - Optional `POST /api/status-pages` for initial create.
  - **Security**: `/edit` and all mutation endpoints must be authenticated/authorized.
  - Acceptance criteria for view/edit consistency, slug stability, and successful legacy migration.

- **Plan** now maps the spec into an architecture and phases:
  - Defines a `status_pages` table with `data` JSON and `schema_version`.
  - Introduces a loader/normalizer that:
    - Strips legacy `zones`.
    - Normalizes `root.props`.
    - Maps legacy FourColumnLayout/StatusBrowserWidget zone data into new slot props.
  - Splits **create** (`POST /api/status-pages`) from **update** (`PUT /api/status-pages/:id` or `/:slug`), and explicitly forbids re-slugifying on updates.
  - Phases out implementation: data model → view route → editor + save/load → slot layouts → inline editing → hardening.

- **Test Plan** is now tailored to this feature:
  - Defines unit, contract, integration, and E2E tests that:
    - Verify JSON schema validity of PageData and ComponentData.
    - Enforce create vs update semantics and **slug stability** (no appending numbers on edit).
    - Validate that legacy Puck data with zones and old props is normalized into slot-based props with no runtime errors (`toString undefined`, `defaultProps` issues).
    - Confirm that the **Status Browser widget** behaves as a multi-column, slot-based widget with:
      - A trigger slot (col1).
      - A selector slot (above status) in col2/3.
      - A status slot in col2/3, not forced into the left nav.

- **Tasks** have been populated from the plan:
  - Phase 0: Types & JSON schema, `status_pages` storage, backend validation.
  - Phase 1: `GET /api/status-pages/:slug` + `StatusPageRenderer` + `/status/:slug` route.
  - Phase 2: `PUT /api/status-pages/:id` or `/:slug` + `StatusPageEditor` shell + `/status/:slug/edit` with auth.
  - Phase 3: Grid/column layouts & slot editing.
  - Phase 4: Inline editing & overlay.
  - Phase 5: API contract tests, performance checks, migration strategy.

- **Implementation Scaffold (README)** has been updated to:
  - Spell out recommended file/module layout for model, APIs, editor, renderer, and layout/slot components.
  - Explain how the `/status/:slug` vs `/status/:slug/edit` split and the loader/normalizer solve the previously-reported issues:
    - Incomplete Puck migrations (zones + root props).
    - Save/load flow creating new pages and appending numbers to slugs.
    - Cramped one-column behavior of the Status Browser widget.

## External / Internal Feedback

- **Sources:**
  - Developer reports of:
    - Puck data migration being incomplete after upgrade to 0.19.3 (legacy zones, old root props, DropZone data persisting).
    - `toString undefined`, `defaultProps` and React `key` warnings, and drag/drop failures in the editor.
    - Save/load behavior where the backend treated saves as creates, **appending numbers to slugs**.
    - Status Browser widget showing up as a tab, but still rendering as a cramped, one-column region in the builder.

- **Summary:**
  - The team’s issues directly motivated the decisions to:
    - Adopt a single JSON `PageData` model as source of truth.
    - Introduce a loader/normalizer in front of Puck Editor/Renderer.
    - Split create vs update semantics in the API and lock slug generation to create only.
    - Design the Status Browser widget as a standalone, slot-based layout (not tied to global nav).

## Impacted Artifacts

- **Intent:** Updated implicitly through this session; existing intent already aligned with the new behaviors (no structural changes required).
- **Context:** States explicit reliance on Puck’s `/edit` pattern, Slots API, and JSON-backed page model.
- **Spec:** Completely replaced scaffold with a detailed description of:
  - Routes.
  - APIs.
  - PageData/ComponentData schema and slot conventions.
  - Security/auth on `/status/:slug/edit`.
- **Plan / Test Plan:** Rewritten to:
  - Encode architecture, phases, and validation steps around the new model and routes.
  - Include tests for migration, save/load, slug stability, and Status Browser widget layout.
- **Tasks / Implementation:** Populated with concrete implementation and testing tasks tied to the spec/plan.

## Risks / Issues Raised

- **R1 – Legacy Data Complexity:**
  - There may be multiple shapes of legacy Puck data (different layouts, component types, and DropZone patterns) that require additional migration rules beyond FourColumnLayout and StatusBrowserWidget.

- **R2 – Partial Migrations in Production:**
  - If some pages were saved after partial upgrades (e.g., mixed zones + slots), migrations might need to be more defensive.

- **R3 – API Consumers:**
  - Any external systems or tools currently using ad-hoc formats for status pages will need to adapt to the canonical `PageData` JSON model.

- **R4 – Auth Gaps:**
  - If `/status/:slug/edit` or `PUT /api/status-pages/...` are not fully protected yet, there is a risk of unauthorized edits or corruption.

## Actions / Follow-ups

1. **A1 – Implement Phase 0–2 Tasks**  
   **Owner:** Dev team lead  
   **Due:** _(TBD)_  
   **Status:** Not started  
   **Details:** Implement `PageData`/`ComponentData` types, storage, validation, and the `GET/POST/PUT` API flows, ensuring create vs update semantics and slug stability.

2. **A2 – Implement Loader/Normalizer**  
   **Owner:** Backend + frontend engineers  
   **Due:** _(TBD)_  
   **Status:** Not started  
   **Details:** Add a loader in front of PuckEditor/PuckRenderer that:
   - Strips `zones`.
   - Normalizes `root.props`.
   - Maps legacy zones into slot props for layouts and the Status Browser widget.
   - Only falls back to template data when input is empty/invalid.

3. **A3 – Write Migration & API Contract Tests**  
   **Owner:** QA / devs  
   **Due:** _(TBD)_  
   **Status:** Not started  
   **Details:** Follow the test plan to write tests that:
   - Confirm correct behavior for `GET/POST/PUT /api/status-pages`.
   - Validate migration of legacy JSON and normalized storage (no `zones`).
   - Assert slug stability across multiple saves.

4. **A4 – Implement Status Browser Widget Layout**  
   **Owner:** Frontend  
   **Due:** _(TBD)_  
   **Status:** Not started  
   **Details:** Implement a `StatusBrowserWidget` component with:
   - Slots: `trigger`, `selector`, `status`.
   - Layout: trigger in col1, selector above status across col2/3, status content using multi-column layout.

5. **A5 – Governance & Validation Scripts**  
   **Owner:** IDSE/governance engineer  
   **Due:** After initial implementation  
   **Status:** Pending  
   **Details:** Run `validate-artifacts.py`, `check-compliance.py`, and `audit-feedback.py` once initial code and tests are in place, and remediate any issues.

## Decision Log

- **D1 – Single JSON Model:**  
  **Decision:** Adopt `PageData { id, slug, title, schemaVersion, root: ComponentData }` as the canonical representation for status pages.  
  **Rationale:** Removes ambiguity between editor vs view formats and makes migrations tractable.

- **D2 – `/status/:slug` + `/status/:slug/edit` Split:**  
  **Decision:** Use `/status/:slug` for read-only view and `/status/:slug/edit` for the visual editor, both backed by the same `PageData`.  
  **Rationale:** Mirrors Puck’s proven pattern and simplifies save/load flows and access control.

- **D3 – Create vs Update Semantics:**  
  **Decision:** Split create and update in the API:
  - `POST /api/status-pages` for initial creation and slug generation.
  - `PUT /api/status-pages/:id` or `/:slug` for updates, **without re-slugifying**.  
  **Rationale:** Prevents slug collisions and the creation of duplicate pages with number-suffixed slugs.

- **D4 – Slot-Based Layouts:**  
  **Decision:** Use slot fields (arrays of `ComponentData`) for layout regions instead of DropZone/zones, including for the Status Browser widget.  
  **Rationale:** Aligns with Puck 0.19+ Slots API, improves portability and makes it straightforward to persist nested layouts.

- **D5 – Loader/Normalizer Before Puck:**  
  **Decision:** Introduce a loader step before PuckEditor/PuckRenderer that normalizes legacy data into the slot-based schema.  
  **Rationale:** Allows the editor and renderer to operate on a consistent shape and gradually eliminate legacy data without breaking existing pages.
