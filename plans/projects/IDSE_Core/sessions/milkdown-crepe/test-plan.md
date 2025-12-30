# Test Plan: milkdown-crepe

Scope
- Validate API correctness, rendering parity with frontend, security (sanitization), and governance integration.

Test suites
1. Unit tests
   - Repository layer: CRUD operations, edge cases, transactionality.
   - API handlers: request validation, auth checks, error handling.
2. Integration tests
   - End-to-end CRUD flow against a test DB.
   - Render endpoint: compare HTML output for a set of fixtures against baseline.
3. Security tests
   - XSS and HTML injection test cases.
   - Access control tests for session-scoped permissions.
4. Governance tests
   - Simulate save operation and assert validate-artifacts.py and check-compliance.py are invoked and reports written.

Fixtures
- tests/fixtures/markdown/ with representative MD files covering headings, lists, code blocks, tables, embedded HTML, and Milkdown plugins used.

Automation
- Run unit and integration tests in CI on PRs.
- Governance scripts run in CI and on save hooks in staging.

Acceptance criteria
- All unit tests pass; integration tests pass in CI with a test DB.
- Render parity: HTML diffs within acceptable tolerance for fixtures.
- Governance reports generated for saved artifacts.
