Artifact Placement Policy

Purpose
- Define canonical locations for IDSE pipeline artifacts, scaffolds, and production source to avoid repeated relocation debates and ensure governance tooling can reliably find session-scoped files.

Scope
- Applies to all contributors and automation modifying session-scoped artifacts, scaffolds, implementation code, CI workflows, and governance reports.

Canonical locations
1. Pipeline artifacts (single source-of-truth, **projects-rooted per Article X**):
   - projects/<project>/sessions/<session>/intents/
   - projects/<project>/sessions/<session>/contexts/
   - projects/<project>/sessions/<session>/specs/
   - projects/<project>/sessions/<session>/plans/
   - projects/<project>/sessions/<session>/tasks/
   - projects/<project>/sessions/<session>/feedback/
   - projects/<project>/sessions/<session>/implementation/

2. Implementation directory (documentation, **NOT** production code):
   - projects/<project>/sessions/<session>/implementation/

   **Purpose:** Documentation artifacts that guide code creation:
   - Validation reports confirming task execution
   - Code examples (illustrative, in markdown)
   - References to actual code locations
   - Handoff records to IDE/development team

   **NOT FOR:**
   - Production source code
   - Working schemas or configurations
   - Executable artifacts that get imported/used by the codebase

   **Rationale:** The IDSE Agency produces documentation that the IDE/development team uses to create actual code. This maintains separation of concerns between documentation (IDSE) and implementation (IDE team).

3. Production source (created by IDE/development team):
   - Repository codebase directories: src/, backend/, frontend/, tests/, etc.
   - Created by reading IDSE pipeline documents
   - Managed through standard PR/review process

4. CI workflows & automation:
   - .github/workflows/ (CI workflows must write governance reports to reports/projects/<project>/sessions/<session>/)

Workflow
- IDSE Agency produces pipeline documentation (intent → spec → plan → tasks)
- Implementation directory contains validation reports and code examples (documentation only)
- IDE/development team reads pipeline documents and creates production code in codebase
- Production code is managed through standard PR/CI process with governance validators

Enforcement
- Validators in idse-governance will check artifact locations and report violations
- IDSE Agency tools must not write production code to implementation/ directories
- Session owners are responsible for ensuring artifacts are documentation only

Exceptions
- None. The implementation/ directory is strictly for documentation artifacts. Production code must live in the codebase.

Rationale
- **Separation of concerns:** IDSE Agency produces documentation; IDE team produces code
- **Traceability:** Session-scoped artifacts enable auditability and governance
- **Clarity:** Eliminates confusion about where production code lives
- **Tool compatibility:** Allows IDE agents to read IDSE docs and write code to appropriate codebase locations

