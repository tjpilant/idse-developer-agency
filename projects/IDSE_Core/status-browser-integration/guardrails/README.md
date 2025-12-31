Project Guardrails — Project_Status_Browser

Purpose
- Provide a visible, project-scoped declaration of which governance/validation checks
  should be run for this project.
- Surface owners and quick-run commands for developers.

What this file does
- Declares the set of automated checks the team requests (validate-artifacts, check-compliance, audit-feedback).
- Points to a lightweight local precheck command to run before commits.
- Indicates where per-session reports should be written.

How to use
1) Local quick-check
   - Run the lightweight validator referenced in guardrails.yml (e.g., `scripts/validate-fast.sh`) before pushing changes.

2) CI validation
   - The CI workflow named in guardrails.yml (if enabled) should run the canonical validation scripts on PRs. See your org CI templates.

3) Reports
   - Validation outputs are written under the session reports path configured in guardrails.yml.

Owners & exceptions
- Owners listed in guardrails.yml are responsible for maintaining this file and authorizing exceptions.
- To request an exception, follow the central governance feedback process and reference the PR needing the exception.

Notes
- This file is a local convenience and does not replace or override central governance policies.
- Enforcement and canonical checks remain in the idse-governance layer and CI configuration.