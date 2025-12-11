# Handoff: Codex → Claude

## Metadata
- Cycle ID: {{handoff_cycle_id}}
- From: codex_gpt
- To: claude_code
- Timestamp: {{timestamp}}
- IDSE Stage: {{active_stage}}
- Plan Reference: plans/current/plan.md

## Review Findings
- (What was reviewed; issues found)

## Recommendations
- (Actions for Claude; cite spec/plan/tasks)

## Validation
- Tests run: ...
- Results: ...

## State Update
- Set `active_llm = claude_code`
- Set `awaiting_handoff = false` after Claude acknowledges
- Update `handoff_cycle_id = {{handoff_cycle_id}}`
- Update `active_stage = {{active_stage}}`
