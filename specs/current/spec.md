# Specification – Project_Status_Browser

Canonical source: `specs/projects/Project_Status_Browser/sessions/session-1765832163/spec.md`. This “current” pointer satisfies governance checks and summarizes the same content for active work.

## Overview
- JSON-backed status pages with a single `PageData` model (slots, schemaVersion, root).
- View route `/status/:slug`; edit route `/status/:slug/edit` (auth required).
- Component registry + renderer; editor operates on the same JSON as view.

## User Stories
- Create/edit status pages visually; save/reload reliably; nested layouts via slots.
- Viewers consume `/status/:slug` read-only; admins ensure auth on edit/save.

## Functional Requirements
- `PageData`/`ComponentData` tree with slot arrays; schema versioning.
- APIs: `GET /api/status-pages/:slug`, `PUT /api/status-pages/:slug` (optional POST/DELETE).
- Editor/view consistency; inline text editing; slot-based layouts (Dashboard/Grid/Column/etc.).

## Non-Functional Requirements
- AuthN/Z on edit/save; validation via JSON schema; resilience to legacy data (zones → slots).
- Performance reasonable for tens/low hundreds of components.

## Acceptance Criteria
- Save/load round-trips preserve slug and do not duplicate records.
- View/edit parity after save; legacy data normalized; Status Browser widget renders multi-column.

## Assumptions / Constraints / Dependencies
- Backed by a `status_pages` store (JSON column), schema validation at the API boundary.
- Component registry is authoritative for allowed types/props.

## Open Questions
- Extent of legacy migration coverage; optional POST/DELETE availability; auth policy details.
