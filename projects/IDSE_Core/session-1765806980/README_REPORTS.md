Reports & publishing for IDSE_Core session

Purpose
- Provide a canonical pointer and instructions for CI/IDE to publish governance and validation reports for this session.

Files
- REPORTS_INDEX.json — canonical index file used by IDEs/agents to discover report paths and status.
- Reports directory: reports/projects/IDSE_Core/sessions/session-1765806980/

How to publish reports (recommended CI/dev host steps)
1) Ensure the reports dir exists:
   mkdir -p reports/projects/IDSE_Core/sessions/session-1765806980

2) Run governance validators and write outputs to the reports dir. Example commands:
   python3 idse-governance/validate-artifacts.py --session IDSE_Core/session-1765806980 --out reports/projects/IDSE_Core/sessions/session-1765806980/validate-artifacts-report.txt
   if [ -f idse-governance/check-compliance.py ]; then
     python3 idse-governance/check-compliance.py --session IDSE_Core/session-1765806980 --out reports/projects/IDSE_Core/sessions/session-1765806980/check-compliance-report.txt
   else
     echo "NOT FOUND" > reports/projects/IDSE_Core/sessions/session-1765806980/check-compliance-report.txt
   fi
   if [ -f idse-governance/audit-feedback.py ]; then
     python3 idse-governance/audit-feedback.py --session IDSE_Core/session-1765806980 --out reports/projects/IDSE_Core/sessions/session-1765806980/audit-feedback-report.txt
   else
     echo "NOT FOUND" > reports/projects/IDSE_Core/sessions/session-1765806980/audit-feedback-report.txt
   fi

3) (Optional) Run fallback validator:
   python3 scripts/validate_artifacts.py --session IDSE_Core/session-1765806980 --out reports/projects/IDSE_Core/sessions/session-1765806980/scripts-validate.log

4) Update REPORTS_INDEX.json using the helper script (recommended) or CI step:
   ./scripts/publish_reports_to_session.sh IDSE_Core session-1765806980

5) IDE/Agent consumption:
   - Read implementation/projects/IDSE_Core/sessions/session-1765806980/REPORTS_INDEX.json to discover report locations and last_updated timestamp.
   - Open or preview report files listed in the index.

Guardrails
- Only write reports under reports/projects/<project>/sessions/<session>/.
- Do not store secrets in report files.
- Use the helper script to ensure REPORTS_INDEX.json is updated atomically.

Contact
- Governance owner: idse-governance team
