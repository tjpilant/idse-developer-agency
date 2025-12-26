# Test Plan – IDSE_Core

Spec: specs/projects/IDSE_Core/sessions/session-1765806980/spec.md  
Plan: plans/projects/IDSE_Core/sessions/session-1765806980/plan.md  

## Overview
Verify the IDSE_Core pipeline, governance integration, and artifact storage for the project/session.

## Test Objectives
- Ensure all artifacts validate with required sections and no placeholders.
- Confirm pipeline orchestration runs in order and blocks on failures.
- Verify governance scripts run and reports are captured.

## Test Types and Approach
- Unit: schema validation, artifact IO, path resolution, orchestrator state transitions.
- Integration: run pipeline on sample artifacts; ensure reports written.
- E2E: CLI/MCP run producing updated artifacts and reports; governance pass/fail surfaced.

## Test Environment
- Local/CI, Python 3.11+, filesystem storage; governance scripts available locally.

## Test Data
- Sample project/session artifacts (intent/context/spec/plan/tasks/implementation/feedback) with valid content.

## Success Criteria
- All tests pass; governance scripts report no errors/placeholders.
- Reports stored under `reports/projects/IDSE_Core/sessions/session-1765806980/`.

## Reporting
- Publish governance and pipeline run outputs to the session reports directory; summarize pass/fail in CI logs.
