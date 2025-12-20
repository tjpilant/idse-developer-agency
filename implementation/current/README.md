# Implementation Scaffold – Project_Status_Browser (current pointer)

Canonical source: `implementation/projects/Project_Status_Browser/sessions/session-1765832163/README.md`. This file mirrors required sections for governance and references the session scaffold.

## Architecture Summary
- JSON-backed status pages in `status_pages` with schema_version + data JSON; view/edit routes share `PageData`.

## Components
- Repository, API handlers, JSON schema validation, component registry, renderer/editor, layout/block components (Dashboard/Grid/Column, StatusHeader/Card/TextBlock, StatusBrowser widget).

## Data Model
- `PageData`/`ComponentData` with slot arrays; schema versioning; slug as route key.

## API Contracts
- `GET /api/status-pages/:slug`, `PUT /api/status-pages/:slug` (optional POST/DELETE); auth required on mutations.

## Test Strategy
- Unit (schema/repo/helpers), contract (API), integration, E2E (view/edit parity, slug stability, legacy migration, widget layout).

## Phases
- Foundations → View route → Editor/save/load → Layout/slots → Inline editing/UX → Hardening.
