# Change Request Playbook (IDSE)

Use this playbook to handle change requests while preserving the structure and
integrity of the IDSE pipeline.

## 1. Receive the request

- Capture requirements: who requested, why, deadlines.
- Identify impacted areas: features, modules, services.
- Gather stakeholders: product, architects, engineers.

## 2. Revisit intent and context

- Update intent: align the change with goals; amend `intent.md` with new goals
  or success criteria.
- Update context: reassess constraints and risks (scale, performance,
  compliance) and record in `context.md`.

## 3. Amend specification

- Modify requirements: update `spec.md` with new requirements/user stories and
  acceptance criteria.
- Remove or mark obsolete sections with historical notes.

## 4. Update implementation plan

- Evaluate architecture: adjust components, data models, or API contracts in
  `plan.md`.
- Assess dependencies: note changes to services or third-party integrations.
- Update test strategy for new/changed behavior.

## 5. Modify tasks

- Add or edit tasks in `tasks.md` for added or altered behavior; remove tasks
  no longer needed.
- Mark parallelizable tasks where appropriate.

## 6. Implementation and validation

- Follow test-first: add contract/integration/e2e coverage for changes.
- Run CI: ensure no unresolved placeholders; execute validation and test suite
  before PR.

## 7. Communication and documentation

- Communicate updated intent, spec, and plan to stakeholders; share timelines.
- Update user docs or API references affected by the change.

## 8. Merge and monitor

- Merge after review and passing checks.
- Monitor logs/metrics post-deploy; feed learnings back into artifacts.

Handling change requests this way keeps modifications aligned with goals and
constraints and avoids ad hoc changes that create ambiguity or debt.***
