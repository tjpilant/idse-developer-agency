# Test Plan

Source spec: /home/tjpilant/projects/idse-developer-agency/specs/projects/Project_Status_Browser/sessions/session-1765832163/spec.md


Testing is first-class in IDSE. This plan targets the read-only Project Status Browser (status API + UI).

## 1. Overview

Goal: Verify the status API and UI correctly surface per-session, per-stage status (exists + `[REQUIRES INPUT]` counts) and validation summaries, read-only, with friendly empty/error states.
In scope: StatusService, status API, frontend session/status views. Out of scope: editing artifacts, triggering pipeline, multi-tenant auth.

## 2. Test Objectives

- Ensure API returns expected shape for projects with sessions, with correct exists + REQUIRES INPUT counts per stage.
- Ensure API handles missing projects/sessions gracefully (404/empty).
- Ensure UI renders sessions list and stage status; handles empty/missing gracefully.
- Ensure validation summary (if available) is displayed; otherwise safe fallback.
- Ensure feature is read-only (no writes triggered).

## 3. Test Types and Approach

### Unit Tests
- StatusService: filesystem scan, REQUIRES INPUT counting, edge cases.

### Contract Tests
- OpenAPI schema for `GET /api/projects/:projectId/sessions` (+ detail if present); payload and error codes.

### Integration Tests
- API call against fixture artifacts in a temp project/session; SessionManager path resolution.

### End-to-End (E2E) Tests
- UI renders sessions, stage status, REQUIRES INPUT counts; missing sessions/artifacts show empty state; validation summary shows when present. (Playwright/Cypress lightweight checks.)

### Performance Tests
- Basic timing for API response with ~50 sessions; log if above target (p95 ≤500ms).

### Security Tests
- Confirm no writes triggered by API/UI; optional auth boundary if enabled; input validation on projectId/sessionId.

## 4. Test Environment

- Python backend (FastAPI), SessionManager paths on local filesystem; frontend Puck/React shell; AG-UI stack. No DB in v1.

## 5. Test Data

- Fixture artifacts under a temp `projects/TestProj/sessions/TestSession/` with staged files and known `[REQUIRES INPUT]` markers. Optional validation report fixture.

## 6. Success Criteria

- All unit/contract/integration/E2E tests pass in CI.
- API response p95 ≤500ms for ~50 sessions (log if exceeded).
- UI shows correct status and handles empty/error cases without crashes.
- No writes observed during tests; guardrails intact.

## 7. Reporting

- CI reports (JUnit/Playwright) for backend and frontend suites; failures triaged to responsible owner.

Use this plan before writing code to align developers, testers, and
stakeholders on verification and quality standards.
