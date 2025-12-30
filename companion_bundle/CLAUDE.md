# IDSE Companion Instructions (Claude)

You are helping inside a project repo that includes the IDSE Companion. Follow these principles:

## Sources of Truth
- `AGENTS.md` (IDE companion rules, quick commands)
- Session awareness: `docs/session-integration.md`
- Hybrid drafts: `docs/hybrid-mode.md`
- Feedback loop: `docs/feedback-loop.md`
- Guardrails: `guardrails/instruction_protection.py`
- Cursor rules: `.cursor/rules/workflow.mdc`, `.cursor/rules/idse-bootstrap.mdc`

## Session & Paths
- Read `.idse_active_session.json` for project/session IDs.
- Resolve artifacts in order: session path `{stage}/projects/{project}/sessions/{session_id}/` → `{stage}/current/` symlink → `{stage}/` → flat file.
- Do not create/switch sessions here (Agency does that).

## Validation & Safety
- Validate artifacts: `python integrations/claude-skill/scripts/validate_artifacts.py . --json` (draft-aware).
- Apply guardrails: input (`instruction_extraction_guardrail`), output (`instruction_leakage_guardrail`), boundary (`idse_boundary_guardrail`).
- Guardrail self-test: `python guardrails/check_guardrails.py`.

## Sync from Agency
- Detect Agency updates: `python utils/sync_detector.py --show-changes` or VS Code task “IDSE: Sync from Agency”.
- CI dispatch handler: `.github/workflows/agency-dispatch-validate.yml` (event `agency-update`).

## Hybrid/Offline Drafts
- Create drafts with `utils/template_writer.py` (marker `[DRAFT - PENDING AGENCY REVIEW]`). Drafts are warnings, not failures.

## Feedback & Pre-commit
- Write feedback: `utils/feedback_writer.py` (session-scoped `feedback.md`).
- Run pre-push: `python scripts/pre_commit_check.py` (spec compliance, simple secret scan, boundary guardrail).
- CI notify (optional): `.github/workflows/validate-and-notify.yml` uses `AGENCY_WEBHOOK_URL` secret if set.

## Boundaries
- Do not write governance artifacts into: `idse-governance/`, `.idse-layer`, `.cursor/config/idse-governance.json`.
- Honor handoff/state files if present.

## Quick Commands
- Session status: `python .cursor/tasks/governance.py`
- Sync check: `python utils/sync_detector.py --show-changes`
- Validate: `python integrations/claude-skill/scripts/validate_artifacts.py . --json`
- Pre-commit: `python scripts/pre_commit_check.py`

## Governance Check (MANDATORY FIRST STEP)
- ALWAYS run `python .cursor/tasks/governance.py view` as the first action in every new conversation.
- VERIFY you are the active_llm before any work; if not active, stop and inform the user.
- For any status question, re-check current state—do not rely on conversation history.
- If active_llm is not Claude, request handoff or ask the user to switch IDE before proceeding.
