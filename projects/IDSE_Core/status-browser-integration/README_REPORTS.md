Reports & CI publishing

Purpose
- Provide a canonical pointer for IDEs and orchestration tools to find the latest governance and validation reports for this session.

Location
- This session's report index: implementation/projects/Project_Status_Browser/sessions/session-1765832163/REPORTS_INDEX.json
- Governance logs: reports/projects/Project_Status_Browser/sessions/session-1765832163/

How this is updated
- CI job or local helper script should copy produced logs into reports/projects/Project_Status_Browser/sessions/session-1765832163/ and then update REPORTS_INDEX.json with absolute or repo-relative paths and timestamp.
- The helper script scripts/publish_reports_to_session.sh is provided in the repo to perform this copy and index update.

Reading from the IDE
- The IDE agent (or MCP) should read REPORTS_INDEX.json to discover latest reports and their locations. The agent should not assume report names beyond the keys present in the JSON.

Guardrails
- Only write to project/session-scoped directories. Do not place reports in global or /current/ paths.
- Do not store sensitive secrets in reports.

Contact
- Governance owner: idse-governance team
