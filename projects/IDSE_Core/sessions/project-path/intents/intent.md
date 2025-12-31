# Intent: Propose change to implementation artifact placement

## Overview
Propose a governance change to the IDSE constitution and implement_system defaults so implementation scaffolds and generated implementation artifacts are written under projects/ (projects/<Project>/sessions/<session>/) instead of implementation/ (implementation/projects/<Project>/sessions/<session>/).

## Purpose
Align where generated implementation artifacts live with the team’s operational preference to house production-facing scaffolds under the project root rather than a separate implementation/ tree. This change aims to simplify discoverability for developers while preserving governance, auditability, and CI validation.

## Proposed change
- Default implement_system output path: switch from implementation/projects/<Project>/sessions/<session>/ to projects/<Project>/sessions/<session>/ for generated scaffolds and implementation README/SCAFFOLD.md files.
- Preserve a clear separation between planned vs committed code by requiring generated artifacts to be written to a dedicated session subfolder and to include metadata ("generated-by", session id, timestamp, and governance tags) to avoid confusion with hand-authored code.
- Add an optional per-invocation override flag to implement_system to allow modern workflows to target implementation/ if desired.

## Rationale
- Developer UX: teams expect implementation scaffolds close to project metadata; locating them under projects/ reduces confusion and speeds onboarding.
- Operational simplicity: avoids duplicating project-level README placeholders and the need for mirrored files between implementation/ and projects/.

## Risks & Mitigations
- Risk: violating current constitutional separation between metadata and implementation may weaken auditability.
  - Mitigation: require generated artifact metadata (who/when/why), maintain CI gates (validate-artifacts/check-compliance) and preserve the existing validators. Update validators to look for the new location while keeping compatibility with the old location for a transition period.
- Risk: tooling compatibility (implement_system, governance scripts) may break.
  - Mitigation: add an agreed migration window where validators accept both locations and implement_system can write to both (mirror) until migration is complete.

## Migration plan
1. Proposal and review (this intent → context → spec → plan → tasks) and stakeholder approval.
2. Update idse-governance validators to accept the new path and run in compatibility mode.
3. Implement implement_system changes to default to projects/ with an override flag and add mirroring support to implementation/ during migration.
4. Run migration tests and backfill existing implementation artifacts if required.
5. Deprecate implementation/ default after a 1–2 release migration window.

## Success criteria
- Governance validators accept and validate generated artifacts in projects/ without errors.
- implement_system writes scaffolds to projects/ by default, with the override flag still supported.
- No regression in validate-artifacts, check-compliance, or audit-feedback workflows.

## Stakeholders
- Proposer: interactive-user
- Reviewers: IDSE governance leads, tooling owners, and repo maintainers

## Open questions
- Desired migration window (duration) and exact validator compatibility rules.
- Whether to mirror artifacts to implementation/ during the migration or to require a single source of truth immediately.

If this intent is approved, I will derive context and produce a specification and migration plan for governance review.
