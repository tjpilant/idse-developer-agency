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
