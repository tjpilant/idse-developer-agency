# Context

Intent reference: intents/projects/IDSE_Core/sessions/session-1765806980/intent.md -> # Project: IDSE_Core

## 1. Environment

- **Product / Project:** Internal **IDSE Developer Agency / IDSE_Core engine**
- **Domain:** Developer tooling / AI-assisted software engineering orchestration
- **Users / Actors:**
  - Individual developers using IDEs / MCP clients
  - CI/CD or automation orchestrators
  - Governance / compliance operators (reading validation and audit reports)

## 2. Stack

- **Frontend:** None in v1 (no dedicated UI; IDE/CLI clients only).

- **Backend / API:**
  - Python 3.11+ core
  - Local CLI + lightweight HTTP or socket-based MCP endpoints for IDE/orchestrator integration (no persistent service required).

- **Database / Storage:**
  - Filesystem-based storage for Markdown/YAML artifacts
  - Project/session-scoped paths (as already used in `intents/`, `contexts/`, `specs/`, etc.)

- **Infrastructure:**
  - Runs on local dev machines and CI runners
  - No cloud dependency required

- **Integrations (v1):**
  - IDEs / tools via MCP endpoints
  - Governance scripts via local CLI:
    - `validate-artifacts.py`
    - `check-compliance.py`
    - `audit-feedback.py`

## 3. Constraints

- **Scale:**
  - Optimized for single-developer or small-team workflows
  - Multiple projects, few concurrent runs

- **Performance:**
  - Pipeline orchestration should feel responsive on a typical dev laptop; most heavy work is in governance scripts or external tools.
  - Pipeline executions must be deterministic given the same inputs and configuration, producing identical artifacts and validation reports.
  - Any intentional non-determinism must be explicitly configured and its effects captured in artifact metadata (e.g., seeds, tool versions, run IDs).

- **Compliance / Security:**
  - Offline by default; no hidden network calls
  - Strict separation of:
    - Governance layer (`idse-governance/`)
    - Application code (`idse_developer_agent/`, `src/`)

- **Team Capabilities:**
  - Built primarily by Python developers familiar with the IDSE docs and governance stack

- **Deadlines:**
  - v1 focused on producing a working reference engine rather than a polished product
  - Timeline flexible but biased toward short, iterative delivery

- **Legacy Considerations:**
  - Must integrate with existing governance scripts rather than replacing them
  - Must not encode governance decision logic inside application code

## 4. Risks & Unknowns

- **Technical Risks:**
  - Over-coupling orchestrator to specific tools or directory layouts.
  - Keeping artifacts, trace logs, and governance outputs in sync and traceable.
  - Schema drift between evolving IDSE documentation and executable core if auto-sync tooling isn’t maintained.

- **Operational Risks:**
  - Misconfiguration or silent failure of governance scripts causing confusing pipeline behavior.
  - Risk of incomplete visibility if validation results aren’t surfaced clearly in IDEs or CI logs.

- **Regulatory Risks:**
  - Low for v1 (internal dev tooling), but governance constraints must still be followed strictly.

- **Unknowns:**
  - Exact status and invocation details of existing governance scripts:
    - `validate-artifacts.py`
    - `check-compliance.py`
    - `audit-feedback.py`
  - Which IDEs/orchestrators will be first-class targets.
