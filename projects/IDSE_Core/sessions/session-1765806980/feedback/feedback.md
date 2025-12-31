# Feedback – IDSE_Core

## External / Internal Feedback
- Early reviewers want deterministic runs, clear governance outputs, and strict separation of app vs governance logic.

## Impacted Artifacts
- Intent, Spec, Plan, Test Plan, Tasks, Implementation scaffold, Governance reports.

## Risks / Issues Raised
- Potential schema drift vs docs; governance misconfiguration in CI; future integration targets to clarify.

## Actions / Follow-ups
- Keep validators in CI; document pipeline run/trace; expand tests for orchestrator and governance adapter.

## Decision Log
- Use filesystem-scoped artifacts; enforce stage order; invoke governance scripts as the single source of compliance; no embedded governance logic in app code.
