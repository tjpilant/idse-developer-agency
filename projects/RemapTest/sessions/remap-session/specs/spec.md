# Specification

## Overview

This session provides a minimal spec to validate the projects-root canonical structure for RemapTest.

## Functional Requirements

- Seed documents exist for all IDSE stages in projects-root layout.
- Validators succeed without relying on legacy stage-root paths.

## Acceptance Criteria

- `validate-artifacts.py` passes in projects-root mode.
- `check-compliance.py` reports no missing artifacts or legacy usage.

## Non-Functional Requirements

- Files must remain in projects-root canonical locations.

## Open Questions

- None for the bootstrap validation baseline.
