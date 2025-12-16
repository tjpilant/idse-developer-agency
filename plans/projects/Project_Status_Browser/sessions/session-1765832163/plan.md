# Implementation Plan

Source spec: /home/tjpilant/projects/idse-developer-agency/specs/projects/Project_Status_Browser/sessions/session-1765832163/spec.md


Use this template to translate a specification into a concrete implementation
plan. Each section should be tailored to the feature or project and stay aligned
with the IDSE constitution.

## 1. Architecture Summary

Read-only status browser in the existing Puck/AG-UI shell. Backend adds a status API that scans SessionManager paths to report per-session, per-stage status and optional validation summary. Frontend adds a sessions list (cols 1–2) and a status pane (col 3); chat stays in col 4. No writes, no pipeline triggers.

## 2. Components

| Component | Responsibility | Interfaces / Dependencies |
| --- | --- | --- |
| StatusService (backend) | Discover sessions; compute per-stage exists + REQUIRES INPUT counts; surface validation summary | SessionManager, filesystem, optional reports/validator output |
| Status API controller | Expose `GET /api/projects/:projectId/sessions` (+ optional detail) | FastAPI backend, SessionManager, StatusService |
| Frontend Session List | List projects/sessions; select active | Puck shell, new status API |
| Frontend Status Pane | Show per-stage status + REQUIRES INPUT counts + validation summary | Status API |
| Config/Feature flag | Enable/disable status browser cleanly | Backend config/env, frontend flag |

## 3. Data Model

Data derived from filesystem; API payload example:
```
ProjectSessionsResponse {
  projectId: string
  sessions: [
    {
      sessionId: string
      stages: {
        intent: { exists: bool, requiresInputCount: int }
        context: { exists: bool, requiresInputCount: int }
        spec: { exists: bool, requiresInputCount: int }
        plan: { exists: bool, requiresInputCount: int }
        testPlan: { exists: bool, requiresInputCount: int }
        tasks: { exists: bool, requiresInputCount: int }
        feedback: { exists: bool, requiresInputCount: int }
      }
      validation?: { ran: bool, passed: bool, errors: int, warnings: int, timestamp?: str }
    }
  ]
}
```

## 4. API Contracts

- `GET /api/projects/:projectId/sessions`
  - Returns `ProjectSessionsResponse`.
  - 200 payload; 404 project not found; 500 on scan errors.
  - Auth: optional v1 (assume local/internal); log errors.
- (Optional) `GET /api/projects/:projectId/sessions/:sessionId`
  - Returns single session status + validation detail; 404 if missing.
- Config flag to disable endpoints if feature off.

## 5. Test Strategy

IDSE mandates test-first; describe validation before implementation:

- Unit: StatusService scan + REQUIRES INPUT counting; path resolution edge cases.
- Contract: OpenAPI schema for status endpoints; error codes; payload shape.
- Integration: end-to-end API using real fixture artifacts; SessionManager paths.
- End-to-end: UI renders sessions/status; handles missing artifacts/sessions gracefully.
- Performance: basic timing for ≤50 sessions; acceptable degradation beyond.
- Security: ensure read-only; no writes; optional auth boundary checks if enabled.

## 6. Phases

Break work into phases; each should deliver incremental value and be
independent where possible.

Phase 0: Backend scaffolding (StatusService + API contracts + feature flag).
Phase 1: Frontend session list + status pane wired to API (read-only).
Phase 2: Validation summary integration, error/empty states, basic perf/logging.
Phase 3: Hardening/tests/docs; optional detail endpoint; config flag toggle.
