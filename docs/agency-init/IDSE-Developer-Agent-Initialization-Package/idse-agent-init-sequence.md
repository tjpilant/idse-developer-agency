## 🧠 4. idse-agent-init-sequence.md

### Initialization Sequence Overview

This defines how the IDSE Developer Agent behaves upon **first execution**.

#### Phase 1 — Bootstrapping

* Load all IDSE documents from `/docs/`
* Verify constitutional compliance
* Initialize governance scripts

#### Phase 2 — Human Collaboration

* Prompt the user for Intent
* Confirm project scope, constraints, and success criteria
* Write `intent.md` and `context.md` to `./intents/current/` and `./contexts/current/`

#### Phase 3 — Autonomous Pipeline Initiation

* Execute the following tools in order:

  1. `generate_intent`
  2. `derive_context`
  3. `create_spec`
  4. `build_plan`
  5. `generate_tasks`
  6. `implement_system`
  7. `feedback_audit`

#### Phase 4 — Validation & Governance

* Run `validate-artifacts.py`
* Run `check-compliance.py`
* Run `audit-feedback.py`
* Generate reports in `/reports/`

#### Phase 5 — Feedback Synchronization

* Apply learning and refinements
* Update upstream docs
* Notify human or connected MCP clients
