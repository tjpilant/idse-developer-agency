# Implementation Plan – Project_Status_Browser (current pointer)

Canonical source: `plans/projects/Project_Status_Browser/sessions/session-1765832163/plan.md`. This file mirrors required sections for governance and references the session plan.

## Architecture Summary
- JSON-backed status pages stored in `status_pages` with schema_version + data JSON.
- View route `/status/:slug` and edit route `/status/:slug/edit` sharing `PageData`.
- Loader/normalizer for legacy data; component registry + renderer/editor.

## Components
- Repository, API handlers, JSON schema validation, renderer/editor, component registry, layout/block components.

## Data Model
- `PageData { id, slug, title, schemaVersion, root: ComponentData }`; slot arrays for layout props.

## API Contracts
- `GET /api/status-pages/:slug`, `PUT /api/status-pages/:slug` (optional POST/DELETE); auth on mutations.

## Test Strategy
- Unit (schema, repo, helpers); contract (API); integration; E2E (view/edit parity, slug stability, legacy migration, Status Browser layout).

## Phases
- Phase 0: types/schema/storage/validation.
- Phase 1: GET + renderer + view route.
- Phase 2: PUT + editor + edit route (auth).
- Phase 3: slot layouts + slot editing/reorder.
- Phase 4: inline editing/overlay UX.
- Phase 5: NFRs/hardening.
