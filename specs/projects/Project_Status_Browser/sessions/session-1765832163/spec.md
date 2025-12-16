# Specification

Intent source: /home/tjpilant/projects/idse-developer-agency/intents/projects/Project_Status_Browser/sessions/session-1765832163/intent.md
Context source: /home/tjpilant/projects/idse-developer-agency/contexts/projects/Project_Status_Browser/sessions/session-1765832163/context.md

## Intent
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

## Context
# Context – Project Status Browser

Intent reference: intents/projects/Project_Status_Browser/sessions/<active>/intent.md

## 1. Environment

- **Product / Project:** Project Status Browser (IDSE Project/Session status board)
- **Domain:** Developer tooling / IDSE pipeline observability
- **Users / Actors:**
  - Developers working with IDSE projects and sessions.
  - Maintainers of the IDSE Developer Agent and governance stack.
  - (Optionally) CI/CD or platform engineers who need to inspect project/session status.

- **Usage Modes:**
  - **Local use:** developers running the existing AG-UI + backend on their machines.
  - **Online use:** deployed alongside the AG-UI backend for remote/internal access (exact deployment topology **[REQUIRES INPUT]**).

## 2. Stack

- **Frontend:**
  - Existing Puck/React-based 4-column AG-UI shell.
  - Right-hand column already hosts the AG-UI chat widget.
  - Project Status Browser UI will reuse this shell:
    - Columns 1–2: project and session list.
    - Column 3: per-session stage status and validation summary.
    - Column 4: existing AG-UI chat, scoped to selected project/session.

- **Backend / API:**
  - **Existing Python backend** that already serves AG-UI SSE endpoints:
    - `POST /inbound` – inbound events/messages from the Puck ChatWidget.
    - `GET /stream` – SSE stream of agent responses and system events ("thinking" / "finished").
  - New read-only API endpoint(s) will be added, e.g.:
    - `GET /api/projects/:projectId/sessions` → returns `ProjectSessionsResponse` JSON.
    - (Optionally) `GET /api/projects/:projectId/sessions/:sessionId` for detailed views. **[REQUIRES INPUT]**

- **Storage:**
  - Filesystem-based storage for IDSE artifacts:
    - `intents/projects/<project>/sessions/<session>/intent.md`
    - `contexts/projects/<project>/sessions/<session>/context.md`
    - `specs/…/spec.md`, `plans/…/plan.md`, `plans/…/test-plan.md`, `tasks/…/tasks.md`, `implementation/…`, `feedback/…/feedback.md`.
  - Session discovery is based on existing directory layout and SessionManager conventions.
  - No additional database is required in v1; all status is derived from existing artifacts.

- **Validation & Governance Integration:**
  - Existing validator script: `scripts/validate_artifacts.py` checks:
    - Required sections per template.
    - Presence and placement of `[REQUIRES INPUT]` markers.
  - Governance scripts referenced in IDSE_Core docs (`validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py`) have **[REQUIRES INPUT]** status and are not assumed to be configured for this project in v1.

## 3. Constraints

- **Scope:**
  - v1 is strictly **read-only**:
    - No editing or regenerating artifacts from the UI.
    - No triggering of pipeline stages or governance scripts from the browser.
  - The browser surfaces status derived from artifacts and (where available) validation summaries.

- **Guardrails & Governance:**
  - Must not bypass IDSE constitutional guardrails:
    - No implicit or hidden autopilot.
    - No writes to project/session artifacts from this feature.
  - Must respect SessionManager project/session scoping and `.owner` conventions.
  - Must not introduce direct coupling between the application code and `idse-governance/` logic; governance information is surfaced via artifacts and existing scripts only.

- **Deployment:**
  - Runs in the same process and environment as the existing AG-UI backend for local development.
  - For online/internal deployments, the Project Status Browser will be exposed through the same frontend/backend stack as the AG-UI. Details about ingress, auth, and network boundaries are **[REQUIRES INPUT]**.

- **Performance:**
  - Status lookups should feel responsive for typical usage:
    - Up to roughly **50 sessions per project** as an initial design target (**tunable, [REQUIRES INPUT]**).
    - Acceptable to compute status on demand by scanning the filesystem; no background indexing required in v1.

## 4. Risks & Unknowns

- **Technical Risks:**
  - Potential performance degradation if the number of sessions or projects grows substantially and status is always computed on-demand from the filesystem.
  - Risk of diverging from SessionManager conventions if path resolution is duplicated rather than reused.
  - Incomplete governance integration: validation summaries may be limited to `scripts/validate_artifacts.py` until broader governance scripts are configured.

- **Operational Risks:**
  - If validation is not run regularly (e.g., in CI), the browser may show stale validation status, giving a false sense of completeness.
  - Online deployments without clear access controls may expose project/session names or statuses more broadly than intended.

- **Security & Access:**
  - v1 assumes the same trust boundary as the existing AG-UI:
    - Local usage is limited to the developer’s environment.
    - Online/internal usage is restricted based on existing frontend/backend deployment and network controls.
  - Explicit authentication/authorization requirements for the browser view are **[REQUIRES INPUT]**.

- **Unknowns / [REQUIRES INPUT]:**
  - Exact deployment topology for online/internal hosting (single-node vs multi-node, behind reverse proxy, etc.).
  - Default set of projects to show (e.g., all under `intents/projects/*` vs curated list).
  - Frequency and ownership of running `scripts/validate_artifacts.py` and any future governance scripts for status to reflect.
  - Long-term ownership of the Project Status Browser (who maintains UX, API shape, and tests).


## Overview
- Summary and link back to intent/context.

## User Stories
- As a developer, I want to see all sessions for a project and their stage status so I can spot gaps quickly.
- As a maintainer, I want to see counts of `[REQUIRES INPUT]` per stage so I know where to focus input gathering.
- As a developer/maintainer, I want to see the latest validation outcome so I know if artifacts passed structural checks.
- As a security-minded user, I want the view to be read-only so we don’t accidentally mutate artifacts from the browser.

## Functional Requirements
- FR-1: Status API – `GET /api/projects/:projectId/sessions` returns sessions and per-stage status (exists flag, `[REQUIRES INPUT]` count).
- FR-2: Optional detail endpoint – `GET /api/projects/:projectId/sessions/:sessionId` returns stage status + validation summary (if available).
- FR-3: Session discovery uses SessionManager conventions (paths under `<stage>/projects/<project>/sessions/<session>`).
- FR-4: UI lists sessions (columns 1–2), shows per-stage status/REQUIRES INPUT counts + validation summary (column 3).
- FR-5: UI is read-only; no artifact edits or pipeline triggers; respects guardrails (no autopilot).
- FR-6: Config flag to enable/disable the status browser without affecting core agent.

## Non-Functional Requirements
- Performance: p95 status fetch for ≤50 sessions per project ≤500ms (filesystem scan acceptable).
- Scale: Target up to ~50 sessions/project; beyond that, acceptable degradation with a note.
- Security: Read-only; no writes; trust boundary same as AG-UI; auth optional v1 (local/internal). No hidden network calls.
- Reliability: Graceful handling of missing artifacts; clear empty states.
- Logging: Log errors for missing/unreadable artifacts and API failures.

## Acceptance Criteria
- AC-1: For a real project (e.g., IDSE_Core), API returns sessions with per-stage exists + REQUIRES INPUT counts.
- AC-2: UI shows sessions list, per-stage status, and validation summary (when available) in the Puck shell.
- AC-3: Feature is read-only; no writes observed during interaction.
- AC-4: Feature can be toggled off via config without breaking AG-UI.
- AC-5: Missing artifacts or no sessions display friendly empty states.

## Assumptions / Constraints / Dependencies
- Assumptions: SessionManager is the source of truth for project/session layout; validation summaries come from existing scripts (when run).
- Constraints: No DB in v1; filesystem only. Must not bypass guardrails or introduce autopilot triggers.
- Dependencies: SessionManager, AG-UI backend/frontend, `scripts/validate_artifacts.py` (optional for summaries).

## Open Questions
- [REQUIRES INPUT] Default project list (all vs curated like IDSE_Core).
- [REQUIRES INPUT] Validation refresh cadence (on-demand vs CI vs scheduled) and where to read cached results.
- [REQUIRES INPUT] Auth for online/internal deployments (none vs reuse existing boundary).
- [REQUIRES INPUT] Who owns ongoing maintenance of the status browser.
