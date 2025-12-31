# Intent: Puck Components

## Overview
Create a set of reusable Puck editor UI components and integration helpers to support embedding Puck-based page editing and PageData import/export within the IDSE Admin dashboard. Components should be library-quality, documented, and test-covered so other workspaces (Puck editor, admin dashboard) can consume them.

## Goal
- Provide a small component library and integration layer so teams can embed Puck editing, PageData import/export, and basic page previews.

## Scope
- In-scope:
  - Reusable React components for Puck editor container, PageData serializer/deserializer, Import/Export dialogs, and Preview panel.
  - TypeScript types and zod schemas for PageData validation (schema_versioned).
  - Unit tests and storybook examples for components.
  - Documentation: spec.md, plan.md, tasks.md, and context.md scaffolds.
- Out-of-scope:
  - Full CRDT collaboration, backend PageData storage (beyond file-first examples), and advanced editor plugins.

## Success Criteria
- Components published under frontend/packages/puck-components and importable by dashboard.
- zod schemas validate sample PageData fixtures and tests pass in CI.
- Storybook showcases core components with examples for import/export and preview.

## Constraints & Assumptions
- Frontend stack: React 18 + TypeScript + Vite; follow existing repo patterns for packages.
- File-first persistence in workspace for examples; DB-backed storage deferred.
- Team will provide sample PageData fixtures for schema development.

## Stakeholders
- Requester: interactive-user
- Owners: frontend team / component maintainers

## Deliverables
- frontend/packages/puck-components (components, types, tests, stories)
- spec.md, plan.md, tasks.md under session-scoped paths

If this intent is correct I will use it as the canonical intent for the session. Reply "derive context" to have me scaffold context.md from this intent and the IDSE docs, or reply here to request edits before I write the intent to the session path.
