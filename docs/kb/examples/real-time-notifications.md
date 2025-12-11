# IDSE End-to-End Example Walkthrough

This walkthrough shows how to apply the IDSE pipeline to a single feature, with
artifacts at each stage and an emphasis on constitutional guardrails and
test-first practice.

## Feature: Real-Time Notifications Panel

Add a real-time notifications panel to an existing web app so users see updates
without refreshing.

### 1. Intent

- **Goal:** Provide an in-app panel that displays real-time notifications about
  relevant events.
- **Problem / Opportunity:** Users cannot see updates without refreshes or
  email. A real-time panel increases engagement and reduces friction.
- **Success Criteria:**
  - Notification latency <2 seconds.
  - Users can see and acknowledge notifications anywhere in the app.
  - Unread notifications persist across sessions until acknowledged.
  - Panel adds <5% to page load time.
- **Scope:**
  - In scope: Frontend component, backend delivery, persistence, WebSocket or
    long-poll transport.
  - Out of scope: Mobile OS push, email notifications, cross-tenant messaging.

### 2. Context

- **Frontend:** Next.js + React using Tailwind CSS.
- **Backend:** Node.js/Express API in production.
- **Database:** PostgreSQL.
- **Real-time layer:** Redis available for pub/sub.
- **Users:** 5,000 concurrent at peak.
- **Compliance:** GDPR; data stored in EU region.
- **Team:** Three full-stack developers; mid-level DevOps support.
- **Constraints:**
  - Fits existing Next.js structure.
  - No breaking changes to current API contracts.
  - Data stays within EU data centers.
  - Supports ≥5k concurrent connections without degradation.
  - DB calls <200 ms.
- **Risks & Unknowns:**
  - Scaling WebSocket connections on current infra.
  - GDPR compliance for logging/tracing.
  - Offline users and reconnection.

### 3. Specification

#### Overview

Implement a real-time notification system. Users see a bell icon with a counter
and can open a panel to view and acknowledge notifications.

#### User Stories

- As a user, I want a badge for new notifications so I do not miss updates.
- As a user, I want to open a slide-in panel to view notifications.
- As a user, I want to mark notifications as read to clear them.

#### Functional Requirements

1. Store notifications in PostgreSQL with: `id`, `user_id`, `type`, `message`,
   `created_at`, `read_at`.
2. Fetch unread notifications via an API endpoint.
3. Mark notifications as read via an API endpoint.
4. Deliver notifications in real time via a WebSocket gateway.
5. Display notifications with a badge and panel.

#### Non-Functional Requirements

1. Scalability: Support 5k concurrent WebSocket connections.
2. Performance: Deliver within 2 seconds of event creation.
3. Compliance: Keep data in EU; comply with GDPR.
4. Resiliency: Handle reconnection and recover missed notifications.
5. Tooling: Use Next.js, Express, PostgreSQL, Redis.

#### Acceptance Criteria

- Notifications appear in the badge within 2 seconds of event creation.
- Opening the panel lists all unread notifications in descending order.
- Acknowledging removes from unread and sets `read_at`.
- System sustains 5k concurrent connections without dropping messages.
- Errors follow existing API error format.

### 4. Implementation Plan

#### Architecture Summary

- **Notification Service (Express module):** Listens for events, writes to DB,
  and publishes to Redis.
- **WebSocket Gateway:** Subscribes to Redis and pushes to clients; maintains
  user connections.
- **Database:** Add `notifications` table with indexes on `user_id`, `read_at`.
- **Frontend Component:** React component connects to WebSocket and displays
  notifications.

#### Components

| Component             | Responsibility                                        |
| --------------------- | ----------------------------------------------------- |
| Event Producer        | Emits notification events (existing services).        |
| Notification Service  | API routes `/api/notifications`, `/api/notifications/read`. |
| Redis Pub/Sub         | Publishes events; gateway subscribes to user channels. |
| WebSocket Gateway     | Maintains sockets; pushes messages to clients.        |
| React Notification UI | Shows badge and slide-in panel.                       |

#### Data Model

```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at    TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
```

#### API Contracts

- `GET /api/notifications` → returns unread notifications.

  Response:

  ```json
  [
    {
      "id": "...",
      "type": "...",
      "message": "...",
      "created_at": "..."
    }
  ]
  ```

- `POST /api/notifications/read` (body: `{ "id": "..." }`) → mark as read.  
  Response: `204 No Content`.

- WebSocket message:

  ```json
  {
    "type": "NOTIFICATION",
    "payload": {
      "id": "...",
      "message": "...",
      "type": "...",
      "created_at": "..."
    }
  }
  ```

#### Test Strategy

1. **Contract tests:** Verify API structures and error codes.
2. **Integration tests:** Event → DB → Redis → WebSocket path.
3. **Performance tests:** Simulate 5k WebSocket connections; measure latency.
4. **End-to-end tests:** UI shows notifications, allows acknowledgment, updates
   badge.

#### Phases

1. **Phase 0 – Foundations**
   - Create `notifications` table migration.
   - Implement Redis publisher in the Notification Service.
   - Configure Redis subscriber in the WebSocket server.
2. **Phase 1 – Core Behavior**
   - Implement `/api/notifications` and `/api/notifications/read`.
   - Develop WebSocket server and integrate with Redis.
   - Build React notification panel and badge.
   - Integrate WebSocket client in Next.js to handle incoming messages.
3. **Phase 2 – Hardening & NFRs**
   - Load test and tune Redis/WebSocket server.
   - Add reconnection logic to fetch missed notifications.
   - Document GDPR considerations.

### 5. Tasks

> `[P]` indicates the task can be done in parallel.

#### Phase 0 – Foundations

- [ ] Task 0.1 – Create DB migration for `notifications` table.
- [ ] Task 0.2 – Implement Redis publisher in the Notification Service.
- [P] [ ] Task 0.3 – Configure Redis subscriber in the WebSocket server.

#### Phase 1 – Core Behavior

- [ ] Task 1.1 – Implement `/api/notifications` and `/api/notifications/read`.
- [ ] Task 1.2 – Develop WebSocket gateway (Node + `ws`).
- [P] [ ] Task 1.3 – Build React notification panel with badge and slide-in
  panel.
- [P] [ ] Task 1.4 – Integrate WebSocket client in Next.js; handle messages.

#### Phase 2 – Hardening & NFRs

- [ ] Task 2.1 – Integration tests for DB → Redis → WebSocket → UI.
- [ ] Task 2.2 – Performance tests for 5k concurrent connections and tuning.
- [ ] Task 2.3 – Reconnection logic to recover missed notifications.
- [ ] Task 2.4 – Review data residency and document compliance.
