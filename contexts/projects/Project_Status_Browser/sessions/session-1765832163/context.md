# Context – Project Status Browser Visual Editor

## Technical Environment
- Project: Project_Status_Browser.
- Expected stack: React-based frontend, likely with routing similar to Next.js (e.g., `/status/:id`), and a backend/API capable of persisting JSON payloads to a database or filesystem.
- Existing implementation: status browser for projects; current status page representation may be static or minimally structured. This increment introduces a JSON-backed page model and editor.

## External Research – Puck Editor Patterns
We studied the Puck editor (https://puckeditor.com/blog and docs) as a reference implementation for a React-first, JSON-backed page editor. Key patterns to reuse or adapt:

### 1. JSON Data Model for Pages
- Puck represents each page as a JSON `data` tree composed of `ComponentData` nodes:
  - Each node has a `type` (component key) and `props` (configuration).
  - Nested content is stored inside props; for Slots, this is typically an array of `ComponentData`.
- Pages are rendered by passing `config` + `data` into a `Render` component, decoupling editing from rendering.

**Implication for Project_Status_Browser:**
- Represent each status page as a JSON document built from `ComponentData` nodes.
- Use a single data model for both editor and renderer; no view-specific hacks.

### 2. Slots for Nested Components
- Puck 0.19 introduced a Slots API (successor to DropZones) for nested components:
  - Define slot fields in component config: e.g., `items: { type: "slot" }`.
  - In `render`, slots are invoked as React components (e.g., `<Items />`), and their underlying value is an array of `ComponentData` stored on the parent’s props.
  - Slots are portable and easy to traverse/transform (e.g., via `walkTree`).

**Implication:**
- Layout and container components in Project_Status_Browser should expose slot-like fields (e.g., `header`, `body`, `footer`, `columns`, `items`) whose values are arrays of nested components.
- Slot content must live in the status page JSON so nested layouts can be saved/loaded reliably.

### 3. Editing UX – Inline Editing and Overlays
- Inline editing (Puck 0.20): text/textarea/custom fields can be marked `contentEditable`, enabling direct on-canvas editing. Render-time values become React nodes rather than plain strings.
- Overlays and portals: Puck uses an overlay for selection/hover; `registerOverlayPortal` allows marking specific elements as “interactive” so they are not blocked by the overlay (e.g., accordions, tabs).

**Implication:**
- Project_Status_Browser should support inline editing for key textual props (titles, descriptions, labels), with a clear contract when values are no longer simple strings.
- The editor should include a selection/overlay layer, with a mechanism to keep certain UI controls interactive when needed (e.g., expandable status sections).

### 4. Save/Load Flow
- Puck editor pattern:
  - `Puck` component receives initial `data` and a `config` describing components.
  - On save/publish, Puck calls `onPublish(data)` with the full page JSON; the hosting app decides how to persist it (filesystem, DB, etc.).
  - `Render` consumes the stored `data` with the same `config` to display the page.
- Next.js recipe: uses `/page` and `/page/edit` routes; `/edit` is open in dev and stores data to filesystem by default, with guidance to switch to DB + auth for production.

**Implication:**
- Status pages should have paired routes:
  - `/status/:id` – read-only renderer.
  - `/status/:id/edit` – editor view, protected with auth.
- A backend API should accept and return the status page JSON; the editor should treat this API as a black box (no tight coupling to storage details).

### 5. Layout Patterns: Grid and Flex
- Puck 0.18 introduced improved drag-and-drop for arbitrary CSS layouts, with documented patterns:
  - **Grid container + Grid item:** grid defines track structure; items define how many rows/columns they span.
  - **Grid container + any item:** any component can participate in grid via dynamic slot/field logic.
  - **Flex container + Flex item:** flex container plus items with `flexGrow`, `flexShrink`, `flexBasis`.
- Best practices include using `allow`/`disallow` for DropZones/slots, and adding editor-only padding for easier selection when editing.

**Implication:**
- For status dashboards and layout-heavy pages, Project_Status_Browser can adopt similar patterns:
  - Components representing layouts (e.g., dashboard, grid, columns) should manage placement and sizing.
  - Other components (cards, text blocks, status indicators) are content; they should plug into these layout slots without needing layout-specific logic.

## Constraints
- Must respect the IDSE constitution and pipeline: no skipping stages and no mixing governance logic into application code.
- Project_Status_Browser is part of `idse_developer_agency/implementation`, so implementation artifacts should reside under:
  - `implementation/projects/Project_Status_Browser/sessions/<active>/...`
- Stateless and framework-agnostic data model: the JSON representation should not depend on specific React implementations beyond component type names and props.

## Risks and Open Questions
- Data migration: if existing status pages are stored differently, we may need migration scripts to move them to the new JSON format.
- Inline editing: treating field values as React nodes vs. strings may complicate serialization or downstream processing; constraints on what inline editing can produce may be required.
- Security: `/status/:id/edit` and mutation APIs must be protected; misuse could lead to arbitrary component trees or layout abuse.
- Performance: deeply nested or very large component trees could impact editor responsiveness; we may need profiling and limits.

## Dependencies
- Frontend framework (React assumed).
- Backend storage mechanism for JSON documents (database, filesystem, or equivalent persistence layer) with compatible APIs.
- Existing Project_Status_Browser routing and authentication mechanisms.
