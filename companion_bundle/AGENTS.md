# IDSE Companion (IDE) Agent Instructions

You are operating inside a project repo with the IDSE Companion. Follow these rules:

## Session Awareness
- Read-only session metadata: `.idse_active_session.json` (project/session id, owner).
- Resolve artifacts in this order: session path `{stage}/projects/{project}/sessions/{session_id}/` → `{stage}/current/` symlink → `{stage}/` → flat `{filename}`.
- Do NOT create or switch sessions here (Agency handles that).
- References: `session_reader.py`, `utils/doc_reader.py`, `docs/session-integration.md`.

## Validation & Guardrails
- Use `integrations/claude-skill/scripts/validate_artifacts.py` (session-aware; draft-aware).
- Boundary guardrail before file ops: see `guardrails/instruction_protection.py`.
- Guardrails self-test: `guardrails/check_guardrails.py`.
- CI: `.github/workflows/agency-dispatch-validate.yml` (dispatch), `guardrails-checks.yml`, `validate-and-notify.yml`.

## Sync from Agency
- Detect latest Agency commit for the active session: `utils/sync_detector.py --show-changes` or VS Code task “IDSE: Sync from Agency”.
- On dispatch `agency-update`, CI re-runs validation.
- Reference: `docs/sync-protocol.md`.

## Hybrid/Offline Drafts
- Create simple drafts when Agency is offline: `utils/template_writer.py`.
- Draft marker: `[DRAFT - PENDING AGENCY REVIEW]`; validator treats drafts as warnings.
- Reference: `docs/hybrid-mode.md`.

## Feedback Loop
- Write implementation feedback to session path: `utils/feedback_writer.py`.
- Pre-push checks: `scripts/pre_commit_check.py` (spec compliance, simple secret scan, boundary guardrail).
- Optional CI notify to Agency via `AGENCY_WEBHOOK_URL`: `validate-and-notify.yml`.
- Reference: `docs/feedback-loop.md`.

## Governance Compliance (CRITICAL)
- FIRST ACTION: Always run `python .cursor/tasks/governance.py view` at conversation start.
- BEFORE ANY WORK: Verify you are the active_llm in `idse-governance/state/state.json`.
- IF NOT ACTIVE: Do not execute commands, make edits, or perform work; request handoff or ask user to switch IDE.
- STATUS REQUESTS: Always check current state, never rely on cached information.
- HANDOFF REQUIRED: If state shows a different active_llm, stop and coordinate handoff.
- Session status: `python .cursor/tasks/governance.py`
- Sync check: `python utils/sync_detector.py --show-changes`
- Validate: `python integrations/claude-skill/scripts/validate_artifacts.py . --json`
- Pre-commit: `python scripts/pre_commit_check.py`
- Draft intent/spec: use `TemplateWriter` in `utils/template_writer.py`
