# Implementation Scaffold – IDSE_Core

Source tasks: tasks/projects/IDSE_Core/sessions/session-1765806980/tasks.md

## Architecture Summary
- Artifact manager for IDSE schemas with deterministic filesystem storage.
- Pipeline orchestrator enforcing stage order and invoking governance scripts.
- Governance adapter collecting reports; CLI/MCP interfaces for run/status.

## Components
- Artifact manager (schemas, IO, metadata)
- Orchestrator (stage runner, validation hooks)
- Governance adapter (validate/compliance/audit invoker)
- Interfaces (CLI/MCP) + tracer/logger

## Data Model
- Markdown/YAML artifacts per stage; validation reports per run; metadata (project, session, timestamps, versions).

## API Contracts
- CLI/MCP commands: run pipeline, status, list artifacts/reports.
- Governance scripts called with project/session; reports written under `reports/projects/<project>/sessions/<session>/`.

## Test Strategy
- Unit: schemas, IO, orchestrator state, governance adapter.
- Integration: pipeline run with sample artifacts.
- E2E: CLI/MCP run produces updated artifacts and reports; governance pass.

## Phases
- Phase 0: Schema/storage foundation.
- Phase 1: Orchestrator core.
- Phase 2: Governance integration.
- Phase 3: Interfaces/hardening.
