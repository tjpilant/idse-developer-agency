# Full Feature Playbook (IDSE)

Follow this for net-new feature delivery under IDSE. Do not skip stages; clear
all `[REQUIRES INPUT]` before advancing.

1) **Define Intent**
- Create `intent.md` from template: goal, stakeholders, measurable success,
  scope (in/out), constraints/risks, priority.

2) **Capture Context**
- Create `context.md`: stack, scale, integrations, compliance, team, deadlines,
  risks/unknowns. Resolve blockers.

3) **Generate Specification**
- Create `spec.md`: user stories, functional and non-functional requirements,
  acceptance criteria, assumptions/constraints/dependencies, open questions.
- Resolve `[REQUIRES INPUT]` before planning.

4) **Implementation Plan**
- Create `plan.md` + `test-plan` from templates: architecture, components, data
  model, API contracts, test strategy, phases. Ensure coverage for all spec
  items.

5) **Break into Tasks**
- Create `tasks.md`: atomic, testable tasks by phase; dependencies/owners;
  `[P]` for parallel-safe tasks. Trace to plan/contracts.

6) **Implement (test-first)**
- Follow tasks; implement contracts/tests before code. Respect simplicity and
  transparency; document deviations and update artifacts.

7) **Validate**
- Run contract, integration, e2e, performance/security tests per test plan. Clear
  all failures and placeholders.

8) **Feedback + Update**
- Capture learnings; update intent/context/spec/plan/tasks for changes; ensure
  artifacts reflect shipped reality.
