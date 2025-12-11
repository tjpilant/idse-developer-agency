# Handoff: Claude → Codex

## Metadata
- Cycle ID: {{handoff_cycle_id}}
- From: claude_code
- To: codex_gpt
- Timestamp: {{timestamp}}
- IDSE Stage: {{active_stage}}
- Plan Reference: plans/current/plan.md

## Summary of Work
- (What was completed; link to artifacts)

## Issues / Risks
- (List blockers, risks, unknowns)

## Requests / Next Actions
- (What Codex should do next; cite tasks/spec/plan)

## Validation
- Tests run: ...
- Results: ...

## State Update
- Set `active_llm = codex_gpt`
- Set `awaiting_handoff = false` after Codex acknowledges
- Update `handoff_cycle_id = {{handoff_cycle_id}}`
- Update `active_stage = {{active_stage}}`
