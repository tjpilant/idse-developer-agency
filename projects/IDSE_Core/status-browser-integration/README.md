# Implementation Scaffold – IDSE_Core

This session README tracks implementation notes for IDSE_Core/status-browser-integration.

## Architecture Summary
- Integrate Status Browser under IDSE_Core without changing the existing project/session layout; reuse governance/reporting patterns.

## Components
- Artifact locations under IDSE_Core for this integration.
- Governance scripts invoked for this session; reports captured.

## Data Model
- Markdown artifacts for intent/context/spec/plan/tasks/implementation/feedback; reports under `reports/projects/IDSE_Core/sessions/status-browser-integration/`.

## API Contracts
- Local/CI scripts only; no external APIs added for this integration.

## Test Strategy
- Run governance validators (validate/compliance/audit) for this session.
- Ensure reports index updates correctly.

## Phases
- Phase 0: Scaffold artifacts and reports.
- Phase 1: Document integration dependency and ensure validators pass.
- Phase 2: Update tasks/plan if further integration work is needed.
