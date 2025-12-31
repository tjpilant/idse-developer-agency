# Specification

## Overview
Canary test specification for Article X implementation.

## Acceptance Criteria
1. SessionManager creates all 7 canonical stage directories
2. Advisory pointer (CURRENT_SESSION) created with correct format
3. Current/ pointers updated for all stages
4. Ownership marker (.owner) created
5. Audit trail generated with all required sections
6. Validators resolve session from pointer in transitional mode
7. Validators detect missing canonical artifacts

## Functional Requirements
- Bootstrap script accepts project, session, and owner parameters
- SessionManager.create_session() returns complete result dictionary
- Validators support --accept-projects-pointer flag
- All operations logged in audit file
