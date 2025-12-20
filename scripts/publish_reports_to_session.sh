#!/usr/bin/env bash
# Helper: publish governance reports into the session folder and update REPORTS_INDEX.json
# Usage: ./scripts/publish_reports_to_session.sh <project> <session>
# Example: ./scripts/publish_reports_to_session.sh Project_Status_Browser session-1765832163

set -euo pipefail
project=${1:-}
session=${2:-}
if [ -z "$project" ] || [ -z "$session" ]; then
  echo "Usage: $0 <project> <session>"
  exit 2
fi

reports_src="reports/projects/$project/sessions/$session"
session_dir="implementation/projects/$project/sessions/$session"
index_file="$session_dir/REPORTS_INDEX.json"

mkdir -p "$reports_src"
mkdir -p "$session_dir"

# copy any logs produced by governance scripts (if they exist)
for f in validate-artifacts.log check-compliance.log audit-feedback.log scripts-validate.log governance-summary.txt; do
  if [ -f "$reports_src/$f" ]; then
    cp -f "$reports_src/$f" "$reports_src/$f" # noop, placeholder to ensure path exists
  fi
done

# Build JSON index entries (null if file missing)
jq -n --arg project "$project" --arg session "$session" \
  --arg last_updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg gov_summary "$( [ -f "$reports_src/governance-summary.txt" ] && echo "$reports_src/governance-summary.txt" || echo null )" \
  --arg validate "$( [ -f "$reports_src/validate-artifacts.log" ] && echo "$reports_src/validate-artifacts.log" || echo null )" \
  --arg check "$( [ -f "$reports_src/check-compliance.log" ] && echo "$reports_src/check-compliance.log" || echo null )" \
  --arg audit "$( [ -f "$reports_src/audit-feedback.log" ] && echo "$reports_src/audit-feedback.log" || echo null )" \
  --arg scripts_validate "$( [ -f "$reports_src/scripts-validate.log" ] && echo "$reports_src/scripts-validate.log" || echo null )" \
  '{project: $project, session: $session, last_updated: $last_updated, status: "UNKNOWN", reports: { governance_summary: ($gov_summary // null), validate_artifacts: ($validate // null), check_compliance: ($check // null), audit_feedback: ($audit // null), scripts_validate: ($scripts_validate // null) }, notes: "Updated by publish_reports_to_session.sh"}' \
  > "$index_file"

chmod 644 "$index_file"

echo "Published report index to $index_file"
