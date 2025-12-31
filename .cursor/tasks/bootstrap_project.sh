#!/bin/bash
# Bootstrap a new IDSE project session
#
# Authority: Article X, Section 2 - Only SessionManager may create sessions
# See: docs/02-idse-constitution.md

set -e

PROJECT="${1:-}"
SESSION="${2:-}"
OWNER="${3:-${USER}}"

if [ -z "$PROJECT" ] || [ -z "$SESSION" ]; then
    echo "Usage: $0 <project> <session-name> [owner]"
    echo ""
    echo "Example:"
    echo "  $0 IDSE_Core puck-components tjpilant"
    echo ""
    echo "Arguments:"
    echo "  project       Project name (e.g., IDSE_Core)"
    echo "  session-name  Human-readable session identifier"
    echo "  owner         Session owner username (default: \$USER)"
    echo ""
    echo "Authority:"
    echo "  Article X, Section 2 - SessionManager creates project sessions"
    echo ""
    echo "See also:"
    echo "  docs/02-idse-constitution.md - Article X"
    echo "  .cursor/tasks/session_manager.py - SessionManager implementation"
    exit 1
fi

echo "🚀 Bootstrapping IDSE project"
echo "   Project: $PROJECT"
echo "   Session: $SESSION"
echo "   Owner: $OWNER"
echo "   Authority: Article X, Section 2"
echo ""

# Navigate to repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# Call SessionManager
python3 .cursor/tasks/session_manager.py "$PROJECT" "$SESSION" "$OWNER"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Bootstrap complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Validate:   python idse-governance/validate-artifacts.py --project $PROJECT --accept-projects-pointer"
    echo "  2. Compliance: python idse-governance/check-compliance.py --project $PROJECT --accept-projects-pointer"
    echo "  3. Begin IDSE pipeline: Start with Intent stage"
    echo ""
    echo "Canonical paths created:"
    echo "  intents/projects/$PROJECT/sessions/$SESSION/"
    echo "  contexts/projects/$PROJECT/sessions/$SESSION/"
    echo "  specs/projects/$PROJECT/sessions/$SESSION/"
    echo "  plans/projects/$PROJECT/sessions/$SESSION/"
    echo "  tasks/projects/$PROJECT/sessions/$SESSION/"
    echo "  implementation/projects/$PROJECT/sessions/$SESSION/"
    echo "  feedback/projects/$PROJECT/sessions/$SESSION/"
else
    echo ""
    echo "❌ Bootstrap failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
fi
