# Tasks – IDSE_Core

Source plan: plans/projects/IDSE_Core/sessions/session-1765806980/plan.md

## Phase 0 – Schema & Storage
- Define artifact schemas (intent/context/spec/plan/tasks/implementation/feedback/validation).
- Implement filesystem IO and path resolution for project/session.
- Add deterministic serialization tests.

## Phase 1 – Orchestrator Core
- Implement stage ordering (Intent → Feedback) with blocking on validation failures.
- Add basic CLI to run pipeline for a project/session.
- Integrate trace/logging for each stage.

## Phase 2 – Governance Integration
- Add adapter to invoke validate-artifacts, check-compliance, audit-feedback.
- Capture reports under `reports/projects/<project>/sessions/<session>/`.
- Surface pass/fail status via CLI.

## Phase 3 – Interfaces & Hardening
- Expose MCP endpoints for run/status/artifacts.
- Expand tests (unit, integration, e2e) for pipeline and governance.
- Performance/robustness cleanup and docs.
