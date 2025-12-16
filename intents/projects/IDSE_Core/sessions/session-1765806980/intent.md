# Project: IDSE_Core

## Intent Summary
IDSE_Core is the foundational layer that turns the IDSE methodology into a working engine — defining structure, validation, and lifecycle for all artifacts that move from intent to implementation. It embodies the philosophy that "software is the expression of intent, constrained by context, and realized through systematic engineering."

## Purpose
Build the **core engine and artifact schemas** that orchestrate the full IDSE pipeline from intent through feedback.
It acts as the validator and enforcement layer for the broader IDSE ecosystem, ensuring that all derivative agents and projects conform to the IDSE constitution.

## Outcome
A **reusable, verifiable foundation** for AI-driven engineering workflows — translating
`intent → context → specification → plan → tasks → implementation → feedback` — with **constitutional guardrails baked in** and enforceable via the governance stack.

IDSE_Core will serve as the canonical reference implementation of the IDSE methodology — ensuring all derivative agents and projects conform to constitutional rules.

## High-Level Intent
Design and implement the **IDSE_Core** engine that orchestrates the full IDSE pipeline
`Intent → Context → Spec → Plan → Tasks → Implementation → Feedback` for software projects. IDSE_Core should provide reusable abstractions, tooling adapters, and MCP/IDE endpoints while strictly honoring the IDSE constitution and governance separation.

## Current State / Starting Point
- We are **not starting from scratch**.
- The **philosophy, constitution, agent roles, and pipeline definitions** already exist in Markdown documentation (the `docs/` set, including `/docs/01–08-idse-docs/`).
- There is **no executable or structured core yet** — no schema, data model, or automation that enforces or validates IDSE stages.
- Status of existing **governance scripts and automation** (e.g., `validate_artifacts.py`, `check_root_artifacts.py`, planned `check-compliance` and `audit-feedback` tools): Governance validation is currently provided by prototype guardrail scripts. `scripts/validate_artifacts.py` (invoked via `python3 scripts/validate_artifacts.py`) checks the current project's core artifacts (`intent.md`, `context.md`, `spec.md`, `plan.md`, `test-plan.md`, `tasks.md`, `implementation/README.md`, `feedback.md`) for required sections and `[REQUIRES INPUT]` markers and exits non-zero on failure while printing human-readable diagnostics to stdout. `scripts/check_root_artifacts.py` enforces allowed root-level artifacts. Dedicated `check-compliance` and `audit-feedback` governance CLIs are planned but not yet implemented; structured JSON report outputs and per-stage governance wiring remain to be added.

## Objectives
- **Codify what is currently in the IDSE docs into functional modules**:
  - **Validators** that check artifacts and pipelines against the IDSE constitution and rules.
  - **Artifact generators** that produce intent, context, specs, plans, tasks, implementation scaffolding, and feedback structures.
  - **Orchestrators** that enforce stage ordering and coordinate tools, governance checks, and external integrations.
- Define a clear, extensible architecture for the IDSE pipeline stages and artifact schemas.
- Implement core orchestration logic that can:
  - Ingest and store intent and context artifacts.
  - Generate specification, plans, tasks, and implementation scaffolding.
  - Capture and integrate feedback in a repeatable loop.
- Integrate with the governance stack (validate-artifacts, compliance checks, feedback audit) without embedding governance logic directly into application code.
- Expose capabilities via MCP/IDE endpoints so external tools can:
  - Query current status and artifacts.
  - Trigger pipeline execution (full or partial).
  - Supply feedback and updated intent/context.

## Scope (Initial Version)

### In Scope (v1)
- **Core schemas and data models** for all IDSE artifacts:
  - intent, context, specification, plan, tasks, implementation notes, feedback, and validation/audit reports.
- **Functional modules** that codify the docs into working components:
  - **Artifact generators** for each stage, wrapping the existing IDSE tools where appropriate.
  - **Validators** that enforce:
    - Stage ordering and completeness.
    - Basic structural and constitutional rules derived from the docs.
  - **Orchestrators** that:
    - Execute the pipeline in strict order (`Intent → Context → Spec → Plan → Tasks → Implementation → Feedback`).
    - Coordinate calls to the existing tools and governance scripts.
- **Artifact storage and retrieval** mechanisms aligned with the current project/session path conventions.
- **Minimal MCP/IDE-facing API surface** to:
  - Trigger full or partial pipeline runs.
  - Query pipeline status and artifact locations.
  - Submit updated intent, context, or feedback.
- **Hooks for governance integration** that:
  - Invoke existing governance scripts (e.g., validate/compliance/audit).
  - Collect and surface their results without re-implementing governance logic.

### Out of Scope (Initial Version)
- Full web UI or visualization dashboard.
- Cloud synchronization or team multi-tenant architecture.
- Deep model integration (stub/mock LLM calls only).
- Non-essential third-party integrations beyond what is needed for core MCP/IDE workflows.
- Embedded/custom governance logic (must remain in the separate governance layer, not inside IDSE_Core).
- Advanced concerns such as distributed execution or heavy performance optimization.

## Constraints & Principles
- Respect strict separation between governance layer (e.g., idse-governance/) and application code (e.g., idse_developer_agent/, src/).
- Follow the IDSE Constitution as the authoritative guide for pipeline behavior and artifact quality (intent supremacy, context alignment, plan-before-build, etc.).
- Design for testability and extensibility: clear interfaces, minimal coupling, and support for future stages/tools.
- Python 3.11+ core, running locally/CI with only standard library + lightweight deps (pydantic, rich, CLI + YAML/Markdown libs).
- Markdown + YAML for artifact serialization; filesystem-based storage in project/session-scoped paths.
- No hidden network calls or platform lock-in; all network use must be explicit and optional.

## Success Criteria (Initial Milestone)
- A new project can be created and traversed through all IDSE stages (`intent.md → context.md → spec.md → plan.md → tasks.md → feedback.md`) with valid, parseable artifacts.
- 
- Documentation reflects actual behavior; engine and docs are self-consistent. Constitutional validation should block skipped stages or missing/untestable data—i.e., any fields still marked '[REQUIRES INPUT]', untestable criteria, or plan‑before‑build violations
- "Root guardrail passes" — IDSE_Core can run its own pipeline and pass its own validations.
- Optional demo: `idse-core new project MyApp` produces a full pipeline skeleton that passes CI validation.

## Open Questions [REQUIRES INPUT]
- Status of existing **governance scripts and automation** once clarified.
