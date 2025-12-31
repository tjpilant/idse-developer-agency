# Specification

## Overview
- Integrate the Status Browser feature into IDSE_Core, reusing governance/reporting patterns and aligning storage/routes.

## User Stories
- As an IDSE Core maintainer, I want Status Browser artifacts under IDSE_Core so governance and reports stay consistent.
- As a reviewer, I want a single reports index for this integration so I can verify validation quickly.

## Functional Requirements
- FR-1: Store Status Browser integration artifacts under IDSE_Core paths without refactoring existing layouts.
- FR-2: Run governance validators (validate/compliance/audit) and publish reports for this session.
- FR-3: Document any dependency on Project_Status_Browser outputs in the plan/tasks.

## Non-Functional Requirements
- Deterministic runs; no hidden network use.
- Keep governance/app separation intact; no governance logic in app code.
- Reports stored under `reports/projects/IDSE_Core/sessions/status-browser-integration/`.

## Acceptance Criteria
- AC-1: Governance validators pass with zero placeholders.
- AC-2: Reports index points to all governance outputs for this session.

## Assumptions / Constraints / Dependencies
- Assumptions: Existing Project_Status_Browser artifacts are reference only; no code refactor.
- Constraints: Keep current directory layout; run scripts locally/CI.
- Dependencies: Governance scripts present (`idse-governance/*.py`), bootstrap script available.

## Open Questions
- None at this time.
