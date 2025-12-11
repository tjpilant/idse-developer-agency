# Refactoring Under IDSE

1) **Re-express Intent**
- Why refactor? Goals (maintainability, performance, safety). Success metrics.

2) **Update Context**
- Current stack/scale, constraints, debt hotspots, dependencies. Risks of change
  (blast radius).

3) **Rewrite Specification**
- Describe desired behavior vs current; compatibility requirements. Note
  unchanged contracts and acceptance criteria. Mark `[REQUIRES INPUT]` if gaps.

4) **Plan (Delta)**
- Update `plan.md` for target architecture; include migration/backout strategy.
  Update test plan for regression coverage.

5) **Produce Delta Tasks**
- Create/update `tasks.md`: atomic steps, safe ordering, backout steps,
  `[P]` for parallel-safe work.

6) **Implement Safely**
- Test-first; preserve contracts unless intentionally changed. Add regression
  tests for known issues; migration scripts if needed.

7) **Validate and Compare**
- Run regression/integration/perf tests; compare baseline vs target metrics.
  Confirm compatibility or document intentional changes.

8) **Feedback and Docs**
- Update artifacts to match reality; document migration/backout notes and user-
  facing changes if any.
