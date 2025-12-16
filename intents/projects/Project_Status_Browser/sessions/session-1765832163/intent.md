# Project: Project Status Browser

## Intent Summary
Build a simple, visual **Project Status Browser** that shows the state of IDSE projects and sessions: which pipeline stages are complete, where `[REQUIRES INPUT]` remains, and whether validation has passed. It should integrate with the existing Puck-based AG-UI shell and SessionManager, and respect IDSE constitutional guardrails (no hidden autopilot, no unsafe writes).

## Purpose
Give developers and maintainers a **single place to see the status of IDSE sessions** without digging through folders or reading raw Markdown. The browser should answer at a glance:

- Which sessions exist for a project?
- Which stages (Intent → Feedback) are present?
- Where are unresolved `[REQUIRES INPUT]` markers?
- Has validation (e.g., `scripts/validate_artifacts.py`) run and passed?

## Outcome
A **read-only status board** embedded in the existing AG-UI Puck shell that:

- Lists sessions for a given project.
- Shows per-stage completion and `[REQUIRES INPUT]` counts.
- Surfaces the latest validation outcome per session (pass/fail, errors/warnings).
- Keeps developers inside the governed IDSE workflow while making progress and gaps obvious.

## Current State / Starting Point
- The IDSE Developer Agent, SessionManager, and filesystem layout are already in place.
- Artifacts are written to `<stage>/projects/<project>/sessions/<session>/<file>`.
- A Puck-based 4-column frontend shell exists with a right-panel AG-UI chat widget wired via SSE (`/inbound`, `/stream`).
- A validation script (`scripts/validate_artifacts.py`) checks required sections and `[REQUIRES INPUT]` markers.
- There is **no visual status browser yet**; status is inferred manually from directories and Markdown files.

## Objectives
- Provide a **Session Status API** (e.g., `GET /api/projects/:projectId/sessions`) that:
  - Discovers sessions for a project.
  - For each session, reports per-stage:
    - Whether the artifact exists.
    - How many `[REQUIRES INPUT]` markers remain.
  - Optionally includes a simple validation summary (ran/passed/errors/warnings/timestamp).
- Integrate the status API into the existing Puck shell:
  - Column 1–2: Project + session list.
  - Column 3: Stage-by-stage status and validation summary for the selected session.
  - Column 4: Existing AG-UI chat widget, scoped to the selected project/session.
- Keep the browser **read-only** in v1: no artifact editing, no pipeline execution from the UI.
- Ensure all behavior respects IDSE guardrails and session/project scoping.

## In Scope (v1)
- Single-project support (e.g., `IDSE_Core`) with the ability to add others via config.
- Backend endpoint(s) to compute and return `ProjectSessionsResponse` from the filesystem.
- Basic frontend components to:
  - List sessions.
  - Show per-stage completion + `[REQUIRES INPUT]` counts.
  - Display a simple validation summary.
- Minimal error handling and empty-state UX (no sessions, missing artifacts, etc.).

## Out of Scope (v1)
- Editing or regenerating artifacts from the UI.
- Triggering pipeline stages or running governance scripts from the UI.
- Multi-tenant / multi-user auth, complex permissions, or role-based views.
- Advanced filtering, search, or historical trend views.
- Rich dashboards or charts beyond a simple tabular/summary view.

## Constraints & Principles
- Must **not** bypass IDSE guardrails:
  - No autopilot; all pipeline runs remain explicit and separate from this browser.
  - Read-only access to artifacts and validation summaries in v1.
- Must respect **SessionManager** conventions for project/session discovery and paths.
- Must be compatible with the existing Puck frontend and SSE backend.
- No hidden network calls beyond the explicit status API; offline-safe by default.
- Keep implementation small and testable; prefer simple filesystem scans + pure functions.

## Success Criteria
- For at least one real project (e.g., `IDSE_Core`), a developer can:
  - Open the AG-UI and see a list of sessions.
  - Select a session and see:
    - Which stages exist.
    - Where `[REQUIRES INPUT]` remains.
    - Whether validation has passed or failed (at least via `scripts/validate_artifacts.py`).
- The browser strictly **reads** from existing artifacts; it never writes or mutates them.
- The status API and UI can be exercised in tests (backend unit tests + minimal frontend checks).
- The feature can be enabled/disabled cleanly (e.g., behind a config flag) without affecting the core agent.

## Open Questions [REQUIRES INPUT]
- Which projects should appear by default in the browser (e.g., only `IDSE_Core`, or all under `intents/projects/*`)?
- How often should validation be run and reflected in the UI (on demand, on commit/CI, scheduled)?
- Who owns the status browser long-term (maintenance, UX changes)?
- Do we need authentication for this view in v1, or is it assumed local/internal only?
