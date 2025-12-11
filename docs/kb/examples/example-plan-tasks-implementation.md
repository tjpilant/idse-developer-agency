# Example — Plan → Tasks → Implementation (Notifications)

## Plan

### Architecture Summary
- Events flow → Notification Service writes to Postgres and publishes to Redis →
  WebSocket Gateway pushes to clients → React panel shows badge/panel.

### Components
| Component | Responsibility | Interfaces / Dependencies |
| --- | --- | --- |
| Notification Service | API routes to fetch/ack notifications; publish events | Postgres, Redis, auth middleware |
| WebSocket Gateway | Maintains sockets; subscribes to Redis; pushes payloads | Redis pub/sub; auth session |
| React Notification UI | Badge + panel; handles WebSocket messages | WebSocket endpoint; REST endpoints |

### Data Model
```
notifications(id, user_id, type, message, created_at, read_at)
idx_notifications_user_read(user_id, read_at)
```

### API Contracts
- `GET /api/notifications` → list unread notifications (desc by created_at)
- `POST /api/notifications/read` body `{ id }` → `204 No Content`
- WebSocket message: `{ "type": "NOTIFICATION", "payload": { id, type, message, created_at } }`

### Test Strategy
- Contract tests for REST + WS payloads
- Integration tests: event → DB → Redis → WS → UI
- Performance: 5k concurrent WS connections; p95 delivery <2s
- Security: auth required for REST/WS; data scoped per user

### Phases
- Phase 0: Foundations (schema, contracts, wiring)
- Phase 1: Core behavior (API, WS, UI)
- Phase 2: NFRs/Hardening (load, reconnect, compliance docs)

## Tasks

> `[P]` means parallel safe.

### Phase 0 – Foundations
- [ ] Task 0.1 – Create DB migration for `notifications` table (Owner: BE)
- [ ] Task 0.2 – Define REST and WS contracts (Owner: BE) (Acceptance:
  contract tests passing)
- [P] [ ] Task 0.3 – Set up Redis pub/sub channels (Owner: BE)

### Phase 1 – Core Behavior
- [ ] Task 1.1 – Implement `/api/notifications` and `/api/notifications/read`
  (Owner: BE) (Acceptance: contract tests)
- [ ] Task 1.2 – Build WebSocket gateway with auth and Redis subscription
  (Owner: BE) (Acceptance: integration test event → client)
- [P] [ ] Task 1.3 – Build React badge + panel; subscribe to WS; render list
  (Owner: FE) (Acceptance: UI shows live updates)
- [P] [ ] Task 1.4 – Wire mark-as-read flow (Owner: FE/BE)

### Phase 2 – NFRs / Hardening
- [ ] Task 2.1 – Load test 5k WS connections; tune configs (Owner: BE/DevOps)
- [ ] Task 2.2 – Implement reconnect + missed notification recovery (Owner: FE)
- [ ] Task 2.3 – Document GDPR/logging approach (Owner: BE) (Acceptance: doc
  reviewed)

## Implementation Notes
- Implementation should follow test-first: contracts → integration → UI tests
  before code.
- Any deviations from spec/plan must be documented and fed back to artifacts.
