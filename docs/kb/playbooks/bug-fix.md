# Bug Fix Playbook (IDSE)

Use this playbook to fix bugs while honoring the IDSE pipeline and constitution.

## 1. Identify the issue

- Reproduce the bug; capture steps, logs, screenshots, errors.
- Classify impact: functionality, performance, security, UX; note severity.
- Review existing artifacts: spec, plan, tasks for covered behavior.

## 2. Update context

- Document new constraints or risks (browser updates, API changes) in
  `context.md`.
- Check environment/dependencies; record any changes.

## 3. Amend specification

- Clarify correct behavior; refine or add acceptance criteria.
- Capture edge cases found during reproduction.

## 4. Adjust implementation plan

- Identify root cause: component/API responsible.
- Plan the fix in `plan.md` (module changes, data model tweaks, API contract
  updates); add needed tests to the plan.

## 5. Create or update tasks

- Add or adjust tasks in `tasks.md`; mark parallelizable items with `[P]` when
  independent.
- Add regression test tasks that reproduce the bug and verify the fix.

## 6. Implement and validate

- Implement the fix following tasks; keep changes simple and aligned to the
  plan.
- Run existing and new tests; ensure the bug is resolved without regressions.

## 7. Feedback and closure

- Review: submit for code review and address feedback.
- Merge: when approved and CI passes (no unresolved placeholders), merge to
  main.
- Documentation: update user-facing docs or release notes if needed.

Following these steps keeps defect work aligned with intent, context, and
specification, and preserves testability and traceability.***
