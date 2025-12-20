# Feedback – Project_Status_Browser (current pointer)

Canonical source: `feedback/projects/Project_Status_Browser/sessions/session-1765832163/feedback.md`. This file mirrors required sections for governance and references the session feedback.

## External / Internal Feedback
- See session feedback for developer reports on Puck migrations, slug duplication, and Status Browser layout issues.

## Impacted Artifacts
- Intent/Context: aligned to JSON-backed editor and `/status/:slug` + `/status/:slug/edit`.
- Spec/Plan/Test Plan: updated to cover PageData schema, slots, routes, APIs, migration, and widget layout.
- Tasks/Implementation: phased tasks based on the session plan.

## Risks / Issues Raised
- Legacy data variability; partial migrations; auth gaps on edit/save; external consumers using ad-hoc formats.

## Actions / Follow-ups
- Implement session tasks/phases; add loader/normalizer for legacy data; enforce auth; add tests for slug stability and widget layout.

## Decision Log
- Adopt JSON `PageData` as single source of truth.
- Use `/status/:slug` (view) and `/status/:slug/edit` (auth) as canonical routes.
- Enforce create vs update semantics (no re-slugifying on update).
- Normalize legacy zones → slot props before rendering/saving.
