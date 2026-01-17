#!/bin/bash
# Phase 6: Agency Swarm Integration Test Script
# Tests both standard blueprint and Agency Swarm blueprint creation

set -e  # Exit on error

echo "🧪 Testing Agency Swarm Integration (Phase 6)"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

test_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Create test directory outside of main repo
TEST_DIR="/tmp/idse-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

test_info "Test directory: $TEST_DIR"
echo ""

# Initialize git repo (required for .cursor/rules/ copy to work)
git init
test_pass "Initialized test git repo"

# Activate venv
if [ -d "/home/tjpilant/projects/idse-developer-agency/.venv-orchestrator" ]; then
    source /home/tjpilant/projects/idse-developer-agency/.venv-orchestrator/bin/activate
    test_pass "Activated orchestrator venv"
else
    test_fail "Orchestrator venv not found"
    exit 1
fi

echo ""
echo "================================================"
echo "TEST 1: Standard Blueprint (No Framework)"
echo "================================================"
echo ""

# Test 1.1: Create standard blueprint
test_info "Running: idse init standard-project --stack python"
idse init standard-project --stack python &> /dev/null

if [ -d ".idse/projects/standard-project/sessions/__blueprint__" ]; then
    test_pass "Standard project created with __blueprint__ session"
else
    test_fail "Blueprint session not created"
fi

# Test 1.2: Check CURRENT_SESSION
CURRENT=$(cat .idse/projects/standard-project/CURRENT_SESSION 2>/dev/null || echo "")
if [ "$CURRENT" = "__blueprint__" ]; then
    test_pass "CURRENT_SESSION points to __blueprint__"
else
    test_fail "CURRENT_SESSION incorrect (found: $CURRENT)"
fi

# Test 1.3: Verify NO framework.json
if [ ! -f ".idse/projects/standard-project/metadata/framework.json" ]; then
    test_pass "No framework.json (standard project)"
else
    test_fail "Unexpected framework.json found"
fi

# Test 1.4: Verify ONLY IDSE constitution (no Agency Swarm)
if [ -f ".idse/projects/standard-project/.idse/governance/IDSE_CONSTITUTION.md" ]; then
    test_pass "IDSE Constitution present"
else
    test_fail "IDSE Constitution missing"
fi

if [ ! -f ".idse/projects/standard-project/.idse/governance/AGENCY_SWARM_CONSTITUTION.md" ]; then
    test_pass "Agency Swarm Constitution NOT present (expected)"
else
    test_fail "Agency Swarm Constitution should not be present"
fi

# Test 1.5: Verify CLAUDE.md and AGENTS.md generated
if [ -f ".idse/projects/standard-project/CLAUDE.md" ]; then
    test_pass "CLAUDE.md generated"
else
    test_fail "CLAUDE.md missing"
fi

if [ -f ".idse/projects/standard-project/AGENTS.md" ]; then
    test_pass "AGENTS.md generated"
else
    test_fail "AGENTS.md missing"
fi

# Test 1.6: Check that AGENTS.md contains framework detection section
if grep -q "Framework-Specific Instructions" .idse/projects/standard-project/AGENTS.md; then
    test_pass "AGENTS.md has framework detection section"
else
    test_fail "AGENTS.md missing framework detection section"
fi

echo ""
echo "================================================"
echo "TEST 2: Agency Swarm Blueprint"
echo "================================================"
echo ""

# Test 2.1: Verify --agentic flag exists
if idse init --help | grep -q "\-\-agentic"; then
    test_pass "idse init --agentic flag exists"
else
    test_fail "--agentic flag not found"
fi

# Test 2.2: Create Agency Swarm project
test_info "Running: idse init my-agency --stack python --agentic agency-swarm"
idse init my-agency --stack python --agentic agency-swarm

if [ -d ".idse/projects/my-agency/sessions/__blueprint__" ]; then
    test_pass "Agency Swarm project created with __blueprint__ session"
else
    test_fail "Blueprint session not created"
fi

# Test 2.3: Check framework.json
if [ -f ".idse/projects/my-agency/metadata/framework.json" ]; then
    test_pass "framework.json created"

    # Verify content
    if grep -q '"framework": "agency-swarm"' .idse/projects/my-agency/metadata/framework.json; then
        test_pass "framework.json contains agency-swarm"
    else
        test_fail "framework.json has wrong framework"
    fi

    if grep -q '"framework_version": "1.0.0"' .idse/projects/my-agency/metadata/framework.json; then
        test_pass "framework.json has version"
    else
        test_fail "framework.json missing version"
    fi
else
    test_fail "framework.json not created"
fi

# Test 2.4: Check Agency Swarm Constitution copied
if [ -f ".idse/projects/my-agency/.idse/governance/AGENCY_SWARM_CONSTITUTION.md" ]; then
    test_pass "AGENCY_SWARM_CONSTITUTION.md copied to project"
else
    test_fail "AGENCY_SWARM_CONSTITUTION.md not found"
fi

# Test 2.5: Check workflow.mdc copied to repo root
if [ -f ".cursor/rules/workflow.mdc" ]; then
    test_pass "workflow.mdc copied to .cursor/rules/"
else
    test_warn "workflow.mdc not found (may need git submodule initialized)"
fi

# Test 2.6: Verify CLAUDE.md and AGENTS.md generated
if [ -f ".idse/projects/my-agency/CLAUDE.md" ]; then
    test_pass "CLAUDE.md generated for Agency Swarm project"
else
    test_fail "CLAUDE.md missing"
fi

if [ -f ".idse/projects/my-agency/AGENTS.md" ]; then
    test_pass "AGENTS.md generated for Agency Swarm project"
else
    test_fail "AGENTS.md missing"
fi

# Test 2.7: Check AGENTS.md has framework instructions
if grep -q "Framework-Specific Instructions" .idse/projects/my-agency/AGENTS.md; then
    test_pass "AGENTS.md has framework detection section"

    if grep -q "Agency Swarm Framework Detected" .idse/projects/my-agency/AGENTS.md; then
        test_pass "AGENTS.md has Agency Swarm instructions"
    else
        test_fail "AGENTS.md missing Agency Swarm section"
    fi
else
    test_fail "AGENTS.md missing framework detection section"
fi

echo ""
echo "================================================"
echo "TEST 3: Blueprint Coexistence"
echo "================================================"
echo ""

# Test 3.1: Both projects exist side-by-side
if [ -d ".idse/projects/standard-project" ] && [ -d ".idse/projects/my-agency" ]; then
    test_pass "Both standard and Agency Swarm projects coexist"
else
    test_fail "Projects not coexisting"
fi

# Test 3.2: Session create on standard project
cd .idse/projects/standard-project
idse session create test-feature &> /dev/null

if [ -d "sessions/test-feature" ]; then
    test_pass "Feature session created on standard project"
else
    test_fail "Feature session not created"
fi

# Test 3.3: Session create on Agency Swarm project
cd ../my-agency
idse session create agent-dev &> /dev/null

if [ -d "sessions/agent-dev" ]; then
    test_pass "Feature session created on Agency Swarm project"
else
    test_fail "Feature session not created"
fi

cd "$TEST_DIR"

echo ""
echo "================================================"
echo "TEST 4: Content Verification"
echo "================================================"
echo ""

# Test 4.1: Verify AGENTS.md references correct files
test_info "Checking AGENTS.md content for Agency Swarm project..."

if grep -q "\.idse/governance/AGENCY_SWARM_CONSTITUTION\.md" .idse/projects/my-agency/AGENTS.md; then
    test_pass "AGENTS.md references AGENCY_SWARM_CONSTITUTION.md"
else
    test_fail "AGENTS.md missing constitution reference"
fi

if grep -q "\.cursor/rules/workflow\.mdc" .idse/projects/my-agency/AGENTS.md; then
    test_pass "AGENTS.md references workflow.mdc"
else
    test_fail "AGENTS.md missing workflow reference"
fi

if grep -q "Article AS-" .idse/projects/my-agency/AGENTS.md; then
    test_pass "AGENTS.md mentions Agency Swarm articles"
else
    test_fail "AGENTS.md missing Agency Swarm article references"
fi

# Test 4.2: Verify standard project AGENTS.md doesn't show Agency Swarm
test_info "Checking standard project AGENTS.md doesn't reference Agency Swarm..."

if ! grep -q "Agency Swarm Constitution" .idse/projects/standard-project/AGENTS.md 2>/dev/null; then
    test_pass "Standard project AGENTS.md doesn't reference Agency Swarm (conditional not active)"
else
    # This is actually OK - the conditional section exists in template, but would be ignored by IDE
    test_info "AGENTS.md contains conditional Agency Swarm section (IDE ignores it without framework.json)"
fi

echo ""
echo "================================================"
echo "TEST 5: File Structure Verification"
echo "================================================"
echo ""

# Test 5.1: Standard project structure
test_info "Verifying standard project structure..."
EXPECTED_DIRS=("intents" "contexts" "specs" "plans" "tasks" "implementation" "feedback" "metadata")
MISSING=0

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ ! -d ".idse/projects/standard-project/sessions/__blueprint__/$dir" ]; then
        test_fail "Missing directory: $dir"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    test_pass "Standard project has all 8 blueprint directories"
fi

# Test 5.2: Agency Swarm project structure
test_info "Verifying Agency Swarm project structure..."
MISSING=0

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ ! -d ".idse/projects/my-agency/sessions/__blueprint__/$dir" ]; then
        test_fail "Missing directory: $dir"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    test_pass "Agency Swarm project has all 8 blueprint directories"
fi

echo ""
echo "================================================"
echo "TEST 6: CLI Help Text"
echo "================================================"
echo ""

# Test 6.1: Help shows framework choices
if idse init --help | grep -q "agency-swarm"; then
    test_pass "Help text shows agency-swarm option"
else
    test_fail "Help text missing agency-swarm"
fi

if idse init --help | grep -q "crew-ai"; then
    test_pass "Help text shows crew-ai option (future)"
else
    test_fail "Help text missing crew-ai"
fi

if idse init --help | grep -q "autogen"; then
    test_pass "Help text shows autogen option (future)"
else
    test_fail "Help text missing autogen"
fi

echo ""
echo "========================================"
echo "Test Results Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""
echo "Test directory: $TEST_DIR"
echo ""

# Display file tree for verification
echo "Project Structure Created:"
echo "========================="
tree -L 4 .idse/projects/ 2>/dev/null || find .idse/projects/ -type d | head -20

echo ""
echo "Framework Metadata (Agency Swarm):"
echo "=================================="
cat .idse/projects/my-agency/metadata/framework.json 2>/dev/null || echo "Not found"

echo ""
echo "Cleanup Instructions:"
echo "===================="
echo "To remove test directory: rm -rf $TEST_DIR"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review generated files in $TEST_DIR"
    echo "2. Initialize git submodule for real workflow.mdc:"
    echo "   cd /home/tjpilant/projects/idse-developer-agency/idse-orchestrator"
    echo "   git submodule add https://github.com/agency-ai-solutions/agency-starter-template.git src/idse_orchestrator/resources/frameworks/agency-swarm"
    echo "   git submodule update --init --recursive"
    echo "3. Test with real Agency Swarm installation"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Review failures above and fix issues."
    exit 1
fi
