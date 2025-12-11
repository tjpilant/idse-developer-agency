# Example — Intent → Context → Specification (Notifications)

## Intent
- **Goal:** Add an in-app real-time notifications panel.
- **Problem / Opportunity:** Users must refresh to see updates; this hurts
  engagement and SLA awareness.
- **Stakeholders / Users:** End-users viewing order/status updates; support team
  for alerts.
- **Success Criteria (measurable):**
  - p95 notification delivery <2 seconds from event.
  - Badge/panel available across app; unread persists across sessions.
  - Page load impact <5%.
- **Scope:**
  - In: Frontend panel + badge, backend delivery, persistence, ack/mark-read.
  - Out: Mobile push, email, cross-tenant messaging.
  - Dependencies: Existing Node API auth/session, Redis for pub/sub.
- **Constraints / Risks:** GDPR/EU residency; scale 5k concurrent; WebSocket
  infra capacity; reconnection/replay handling.

## Context
- **Stack:** Next.js + React, Node/Express API, Postgres, Redis pub/sub.
- **Scale:** 5k concurrent users; bursty event volume.
- **Integrations:** Existing services emit events; no breaking API changes
  allowed.
- **Compliance:** GDPR/EU data residency; audit for access/logging.
- **Team/Timeline:** 3 full-stack devs; release target in next sprint.
- **Risks/Unknowns:** WebSocket scaling on current infra; logging/tracing
  compliance; offline/reconnect strategy.

## Specification

### User Stories
- As a user, I see a badge when new notifications arrive.
- As a user, I open a panel to view notifications without refreshing.
- As a user, I mark notifications as read to clear them.

### Functional Requirements
- FR-1: Store notifications with `id`, `user_id`, `type`, `message`,
  `created_at`, `read_at`.
- FR-2: Provide `GET /api/notifications` for unread notifications.
- FR-3: Provide `POST /api/notifications/read` to mark read.
- FR-4: Deliver notifications in real time via WebSocket to authenticated users.
- FR-5: Persist acknowledgments and update badge/panel.

### Non-Functional Requirements
- NFR-1: p95 delivery <2 seconds from event to client.
- NFR-2: Sustain 5k concurrent WebSocket connections.
- NFR-3: Data residency in EU; log access for audit.
- NFR-4: Graceful reconnect with missed notification recovery.

### Acceptance Criteria
- AC-1: Badge updates within 2 seconds of event creation.
- AC-2: Panel lists unread notifications in desc time order.
- AC-3: Marking read sets `read_at` and removes from unread.
- AC-4: Load test at 5k connections shows no drops or missed messages.
- AC-5: Endpoints return errors in standard API format.

### Assumptions / Constraints / Dependencies
- Assumes Redis pub/sub available; assumes existing auth/session middleware.
- Constraints: No breaking changes to existing API consumers.
- Dependencies: Event producers send user-scoped events.

### Open Questions
- [REQUIRES INPUT] Should read-state be per user or per device/session?
- [REQUIRES INPUT] Retention period for notifications?
