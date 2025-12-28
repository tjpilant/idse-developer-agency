# Hybrid/Offline Mode (Companion)

When the Agency service is unavailable, the Companion can create simple draft artifacts locally and mark them for later refinement.

## How it Works
- Drafts include a marker: `[DRAFT - PENDING AGENCY REVIEW]`.
- Validation treats drafts as warnings (⚠️) instead of failures, even if `[REQUIRES INPUT]` markers remain.
- Session-aware paths are still used if `.idse_active_session.json` exists; otherwise files are written under `{stage}/filename`.

## Draft Creation
Use `utils/template_writer.py`:
- `TemplateWriter.create_intent_draft(description)`
- `TemplateWriter.create_spec_draft(intent_summary)`

Examples (from repo root):
```bash
python - <<'PY'
from utils.template_writer import TemplateWriter
tw = TemplateWriter()
tw.create_intent_draft("Offline draft for checkout improvements")
PY
```

## Validation Behavior
- Drafts are marked with ⚠️ in the report.
- `[REQUIRES INPUT]` markers remain and should be resolved after Agency review.

## When to Use
- No connectivity to the Agency.
- Quick scaffolding before requesting a full artifact from the Agency.

## Upgrade Path
- Once Agency is available, request full generation and replace the draft; remove the draft marker when finalized.
