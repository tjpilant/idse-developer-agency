Artifact Placement Policy

Purpose
- Define canonical locations for IDSE pipeline artifacts, scaffolds, and production source to avoid repeated relocation debates and ensure governance tooling can reliably find session-scoped files.

Scope
- Applies to all contributors and automation modifying session-scoped artifacts, scaffolds, implementation code, CI workflows, and governance reports.

Canonical locations
1. Pipeline artifacts (single source-of-truth):
   - intents/projects/<project>/sessions/<session>/
   - contexts/projects/<project>/sessions/<session>/
   - specs/projects/<project>/sessions/<session>/
   - plans/projects/<project>/sessions/<session>/
   - tasks/projects/<project>/sessions/<session>/
   - feedback/projects/<project>/sessions/<session>/
   - reports/projects/<project>/sessions/<session>/

2. Implementation scaffolds (staging, non-production):
   - projects/<project>/sessions/<session>/implementation/
   Rationale: scaffolds are staging artifacts tied to a session. They are discoverable by session owner and governance tooling but explicitly separated from production source.

3. Production source (post-approval):
   - projects/<project>/src/ OR repo-root src/ (project convention)
   Promotion to production requires an approved PR and passing governance validators in CI.

4. CI workflows & automation:
   - .github/workflows/ (CI workflows must write governance reports to reports/projects/<project>/sessions/<session>/)

Promotion rules
- Scaffolds remain in projects/<project>/sessions/<session>/implementation/ until the design is approved by stakeholders and governance validators PASS.
- To promote:
  1. Create a PR that introduces production code under projects/<project>/src/ (or src/) and references the session artifacts (spec, plan, tasks).
  2. CI must run validate-artifacts.py, check-compliance.py, and audit-feedback.py and produce reports under reports/projects/<project>/sessions/<session>/.
  3. Only after CI passes and reviewers approve may the PR be merged.

Enforcement
- Validators in idse-governance will check artifact locations and report violations in reports/. Repeated violations will be escalated to project owners.
- Session owners are responsible for ensuring artifacts are placed correctly and for initiating promotions.

Exceptions
- Short-lived experimental code may be stored under implementation/ with explicit labeling and an expiry/cleanup note; exceptions must be documented in feedback/projects/<project>/sessions/<session>/feedback.md and approved by project owners.

Rationale
- Separation of concerns: keeps design/scaffold artifacts separate from production source.
- Traceability: session-scoped artifacts and reports enable auditability and governance.
- Safety: prevents accidental merging of unapproved scaffolds into production code.

