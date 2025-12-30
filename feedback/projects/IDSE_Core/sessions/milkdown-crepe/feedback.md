# Feedback: milkdown-crepe

 Summary:
- Intent, context, spec, plan, and tasks updated to local-first write mode (workspace saves only), with optional PR mode gated by config. MD Editor to be added in-shell alongside Puck/Status Browser; content bridges (embed markdown, copy-to-Puck) planned. Governance docs aligned; validate-artifacts passing.

Requester notes:
- Timeline: ASAP
- Requester: tjpilant

External / Internal Feedback
- External: Pending reviewer assignment.
- Internal: Agent review completed; awaiting Dev Team review.

Impacted Artifacts
- intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md
- contexts/projects/IDSE_Core/sessions/milkdown-crepe/context.md
- specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md
- plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md
- tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md
- implementation/projects/IDSE_Core/sessions/milkdown-crepe/README.md
- backend/README.md (admin shell notes)

Risks / Issues Raised
- XSS risk in Markdown rendering; mitigation: rehype-sanitize/DOMPurify and security tests.
- Mode confusion (local vs PR) could lead to unexpected git writes; mitigation: default WRITE_MODE=local, UI banner, explicit opt-in for PR mode.
- DeprecationWarning in governance scripts (datetime.utcnow) remains; minor ops fix.

Actions / Follow-ups
- A1: Wire MD Editor tab in shell with `VITE_MD_EDITOR_ENABLED`, local write mode, and “Open in MD Editor” links from Status Browser — owner: interactive-user
- A2: Implement Markdown Embed block (read-only) in Puck that renders via render endpoint — owner: interactive-user
- A3: Optional Copy-to-Puck action design (one-way) — owner: interactive-user
- A4: Assign Dev Team reviewer for ACL/sanitizer review — owner: tjpilant
- A5: Fix governance DeprecationWarning (datetime.utcnow) — owner: infra

Decision Log
- D1: Persistence: file-first in local workspace; no automatic git/PR writes from editor service. External sync handles git/PR.
- D2: Optional PR mode allowed later behind config; requires explicit enable + GitHub token.
- D3: Rendering: remark → rehype + rehype-sanitize/DOMPurify; semantic parity acceptable.
- D4: MD Editor to live in same shell as Puck/Status Browser; content bridges via embed/copy patterns (read-only or one-way).

Action history
- Artifacts updated for local-first mode; plan/tasks/spec/context/intent patched; backend README noted admin shell; validate-artifacts passing (report in reports/IDSE_Core_milkdown-crepe_1767037953/validate-artifacts-report.txt).
