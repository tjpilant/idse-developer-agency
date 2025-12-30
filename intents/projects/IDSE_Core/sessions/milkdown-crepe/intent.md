# Intent: milkdown-crepe

## Overview
Add a backend feature to support the agency's Milkdown-based Markdown editor with Crepe integration for server-side document management and rendering. This service will enable reading and editing of session-scoped IDSE pipeline documents (intent, context, spec, plan, tasks, implementation artifacts).

## Purpose
Provide server endpoints and services so Milkdown (client) can save, load, and request server-side rendering of session-scoped IDSE pipeline artifacts, enforcing session-scoped ownership and IDSE governance.

## Scope
- In-scope:
  - Backend API endpoints to save/load session-scoped documents and to render Markdown → sanitized HTML.
  - Integration with Crepe/Milkdown patterns (client provides Markdown or AST).
  - Basic access control enforcing session-scoped ownership and role-based editing.
  - Unit and contract tests for API and renderer, and CI integration to run governance checks.
- Out-of-scope:
  - Frontend editor feature changes beyond minimal integration (the client adapter), advanced real-time collaboration, and performance tuning beyond basic validation.

## Constraints & Assumptions
- Security: All server-rendered HTML must be sanitized to prevent XSS; follow IDSE Core security practices.
- Licensing: Milkdown is MIT; verify any additional plugins/themes for compatibility.
- Assumed defaults (confirm or change):
  - Backend runtime: Node.js LTS (recommended).
  - Persistence: file-first in the local workspace repository; no automatic git/PR writes by the editor service. External sync (IDE/agency) handles pushing.
  - Renderer: remark → rehype + rehype-sanitize / DOMPurify for sanitization; semantic parity is acceptable (exact HTML parity not required).
  - ACL model: per-session ownership + role-based (owner, collaborator, reader) enforced at API middleware.
- Integration: CI runs validate-artifacts and check-compliance on PRs created by the IDE/agency sync (not by the editor service).

## Success criteria (measurable)
- Endpoints exist: GET /api/sessions/:project/:session/documents?path=..., PUT /api/sessions/:project/:session/documents, POST /api/sessions/:project/:session/render.
- Unit tests for repository, handlers, and renderer; contract tests for GET/PUT/render (200/400/401/403/404).
- Server-rendered HTML is sanitized and matches expected semantic output for representative markdown inputs.
- PR passes validate-artifacts and check-compliance in CI.

## Deliverables
- API handlers and repository code for persisting session-scoped documents.
- Renderer pipeline and sanitizer configuration.
- Tests: unit, contract, minimal E2E.
- Documentation: spec.md, plan.md, tasks.md, and context.md.

## Stakeholders
- Requester: tjpilant
- Owner: interactive-user

## Future enhancements / roadmap considerations
- Puck editor integration: support storing PageData JSON in addition to Markdown; provide import/export between Puck PageData and canonical Markdown; define schema_version and zod schemas for PageData validation and migration.
- Hybrid storage option: add Postgres (jsonb) for structured content, metadata indexing, and richer queries while keeping canonical Markdown files in the repository for governance.
- Real-time collaboration: evaluate CRDT or operational transform layers if live collaboration is later required.
- Rendering parity: evaluate using Milkdown server-side rendering if stricter parity is needed instead of remark/rehype.
- Governance sync: background job to sync DB-backed artifacts back into repo branches/PRs for auditability.

## Resolved decisions (2025-12-29)
1. Backend runtime: Node.js LTS.
2. Storage/persistence: file-first in the local workspace repository; no automatic PR/branch writes from the editor service. Git sync is handled externally by IDE/agency workflows.
3. Auth: Bearer token via existing IDSE auth middleware; enforce per-session ACLs (owner/collaborator/reader).
4. Rendering parity: semantic equivalence (not exact HTML match) using remark → rehype + rehype-sanitize / DOMPurify.
5. Sample documents for tests: use the session’s own intent, spec, plan, and tasks artifacts.
6. CI placement: validate-artifacts and check-compliance run on PRs produced by external sync (not by the editor service).


If this intent is correct I will use it as the canonical intent for the session. Reply "derive context" to have me scaffold context.md from this intent and the IDSE docs, or provide edits and I will update the intent before deriving context.
