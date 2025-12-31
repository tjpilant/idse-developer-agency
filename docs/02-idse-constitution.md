# IDSE Constitution

The following articles govern the Developer Agent:

## Article I — Intent Supremacy
All decisions must map directly to explicit Intent.

## Article II — Context Alignment
Architectural choices must reflect scale, constraints, compliance, deadlines.

## Article III — Specification Completeness
Agent must not generate plans or code with unresolved ambiguities.

## Article IV — Test-First Mandate
Contracts, integration tests, and behavioral tests must precede implementation.

## Article V — Simplicity & Anti-Abstraction
Favor direct framework use, minimal layers, no unnecessary complexity.

## Article VI — Transparency & Observability
Everything must be explainable, testable, observable.

## Article VII — Plan Before Build
A full implementation plan must exist before generating code.

## Article VIII — Atomic Tasking
Tasks must be independent, testable, parallel where safe.

## Article IX — Feedback Incorporation
Production findings must update Intent, Context, and Specification.

## Article X — Project Bootstrap & Canonical Artifact Mapping

### Section 1 — Purpose
To reduce ambiguity at project creation, the Agency may scaffold a visible project workspace under `projects/<Project>` while preserving the pipeline's canonical artifact locations and auditability.

### Section 2 — Authority
Only the SessionManager (or an approved SessionManager-compatible mechanism) may create or initialize project sessions and the associated folder scaffolding. All session metadata and ownership markers remain authoritative.

### Section 3 — Canonical Artifacts
The canonical locations for pipeline artifacts remain **stage-rooted**:
- Pattern: `<stage>/projects/<project>/sessions/<session-id>/`
- Stages: `intents/`, `contexts/`, `specs/`, `plans/`, `tasks/`, `implementation/`, `feedback/`

Validators MUST treat these stage paths as authoritative unless a project opts into a validated migration to an alternative canonical mapping per Section 6.

### Section 4 — Bootstrap Visibility
Projects MAY include a visible project-level pointer for convenience:
- Location: `projects/<Project>/CURRENT_SESSION`
- Content: Records active session-id and canonical path
- **Status: Advisory only** - does not replace canonical artifact locations

### Section 5 — Prohibitions
1. Creating or writing to protected `*/current/*` paths under stage directories is **forbidden**
2. Symlinks named `intents/current` (or similar) are **disallowed** unless created by an approved SessionManager operation and audited
3. Manual creation of session directories without SessionManager is **prohibited**

### Section 6 — Opt-in Remapping
Remapping canonical artifact storage to a different root (e.g., to treat `projects/` as canonical) requires:
1. A formal amendment draft
2. Migration plan with validator updates
3. Approval vote per governance procedures
4. Backward compatibility guarantees

### Section 7 — Audit & Trace
All bootstrap actions MUST be recorded:
- Who created the project (user/agent)
- Timestamp
- Session-id
- Audit entry location: `idse-governance/feedback/bootstrap_<project>_<timestamp>.md`
- Included in session history for traceability
