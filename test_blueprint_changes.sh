#!/bin/bash
# Blueprint Implementation Verification Script
# Run from repository root

set -e  # Exit on error

echo "🧪 Testing Blueprint Implementation Changes"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up test projects..."
    rm -rf .idse/projects/test-blueprint-project 2>/dev/null || true
    rm -rf .idse/projects/guided-test 2>/dev/null || true
    rm -rf .idse/projects/installed-blueprint 2>/dev/null || true
}

trap cleanup EXIT

echo "Phase 1: Project UUID Caching"
echo "------------------------------"

# Activate venv
if [ -d ".venv-orchestrator" ]; then
    source .venv-orchestrator/bin/activate
    test_pass "Activated orchestrator venv"
else
    test_fail "Orchestrator venv not found - run: python3 -m venv .venv-orchestrator && source .venv-orchestrator/bin/activate && pip install -e idse-orchestrator/"
    exit 1
fi

# Test 1: Check if idse command exists
if command -v idse &> /dev/null; then
    test_pass "idse command installed"
else
    test_fail "idse command not found - run: pip install -e idse-orchestrator/"
    exit 1
fi

# Test 2: Check if --help works
if idse --help &> /dev/null; then
    test_pass "idse --help works"
else
    test_fail "idse --help failed"
fi

echo ""
echo "Phase 2: Blueprint as Default"
echo "------------------------------"

# Test 3: Init creates __blueprint__ session
cleanup  # Clean before test
idse init test-blueprint-project --no-create-agent-files &> /dev/null

if [ -d ".idse/projects/test-blueprint-project/sessions/__blueprint__" ]; then
    test_pass "idse init creates __blueprint__ session"
else
    test_fail "idse init did not create __blueprint__ session"
fi

# Test 4: CURRENT_SESSION points to __blueprint__
CURRENT_SESSION=$(cat .idse/projects/test-blueprint-project/CURRENT_SESSION 2>/dev/null || echo "")
if [ "$CURRENT_SESSION" = "__blueprint__" ]; then
    test_pass "CURRENT_SESSION points to __blueprint__"
else
    test_fail "CURRENT_SESSION does not point to __blueprint__ (found: $CURRENT_SESSION)"
fi

# Test 5: Blueprint has all 7 pipeline directories
BLUEPRINT_PATH=".idse/projects/test-blueprint-project/sessions/__blueprint__"
EXPECTED_DIRS=("intents" "contexts" "specs" "plans" "tasks" "implementation" "feedback" "metadata")
MISSING_DIRS=0

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ ! -d "$BLUEPRINT_PATH/$dir" ]; then
        test_fail "Missing directory: $dir"
        ((MISSING_DIRS++))
    fi
done

if [ $MISSING_DIRS -eq 0 ]; then
    test_pass "All 7 blueprint directories created"
fi

echo ""
echo "Phase 3: Blueprint Commands"
echo "----------------------------"

# Test 6: blueprint group exists
if idse blueprint --help &> /dev/null; then
    test_pass "idse blueprint command exists"
else
    test_fail "idse blueprint command not found"
fi

# Test 7: blueprint list exists
if idse blueprint list --help &> /dev/null; then
    test_pass "idse blueprint list command exists"
else
    test_fail "idse blueprint list command not found"
fi

# Test 8: blueprint install exists
if idse blueprint install --help &> /dev/null; then
    test_pass "idse blueprint install command exists"
else
    test_fail "idse blueprint install command not found"
fi

# Test 9: Check backend endpoint (if backend is running)
if curl -s http://localhost:8000/sync/blueprints &> /dev/null; then
    test_pass "Backend /sync/blueprints endpoint accessible"

    # Test 10: Check if endpoint returns valid JSON
    RESPONSE=$(curl -s http://localhost:8000/sync/blueprints)
    if echo "$RESPONSE" | jq . &> /dev/null; then
        test_pass "Backend returns valid JSON"
    else
        test_fail "Backend does not return valid JSON"
    fi
else
    test_warn "Backend not running - skipping endpoint tests (start with: cd backend && python3 -m uvicorn main:app --reload)"
fi

echo ""
echo "Phase 4: Guided Blueprint Creation"
echo "-----------------------------------"

# Test 11: Check if --guided flag exists
if idse init --help | grep -q "\-\-guided"; then
    test_pass "idse init --guided flag exists"
else
    test_fail "idse init --guided flag not found"
fi

# Test 12: Check if blueprint_wizard.py exists
if [ -f "idse-orchestrator/src/idse_orchestrator/blueprint_wizard.py" ]; then
    test_pass "blueprint_wizard.py module created"
else
    test_fail "blueprint_wizard.py module not found"
fi

# Test 13: Check if BlueprintWizard class exists
if grep -q "class BlueprintWizard" idse-orchestrator/src/idse_orchestrator/blueprint_wizard.py; then
    test_pass "BlueprintWizard class exists"
else
    test_fail "BlueprintWizard class not found"
fi

echo ""
echo "Phase 5: Session Create Command"
echo "--------------------------------"

# Test 14: session group exists
if idse session --help &> /dev/null; then
    test_pass "idse session command exists"
else
    test_fail "idse session command not found"
fi

# Test 15: session create exists
if idse session create --help &> /dev/null; then
    test_pass "idse session create command exists"
else
    test_fail "idse session create command not found"
fi

# Test 16: Create feature session
if idse session create test-feature --project test-blueprint-project &> /dev/null; then
    test_pass "idse session create works"

    # Test 17: Verify session directory created
    if [ -d ".idse/projects/test-blueprint-project/sessions/test-feature" ]; then
        test_pass "Feature session directory created"
    else
        test_fail "Feature session directory not created"
    fi

    # Test 18: Verify CURRENT_SESSION updated
    NEW_CURRENT=$(cat .idse/projects/test-blueprint-project/CURRENT_SESSION 2>/dev/null || echo "")
    if [ "$NEW_CURRENT" = "test-feature" ]; then
        test_pass "CURRENT_SESSION updated to test-feature"
    else
        test_fail "CURRENT_SESSION not updated (found: $NEW_CURRENT)"
    fi
else
    test_fail "idse session create failed"
fi

echo ""
echo "Code Quality Checks"
echo "-------------------"

# Test 19: Check for Python syntax errors
if python3 -m py_compile idse-orchestrator/src/idse_orchestrator/*.py 2>/dev/null; then
    test_pass "No Python syntax errors in orchestrator modules"
else
    test_fail "Python syntax errors detected"
fi

# Test 20: Check imports in cli.py
if grep -q "from .blueprint_wizard import BlueprintWizard" idse-orchestrator/src/idse_orchestrator/cli.py; then
    test_pass "BlueprintWizard imported in cli.py"
else
    test_warn "BlueprintWizard import not found in cli.py (may be conditional)"
fi

# Test 21: Check project_manager has new methods
if grep -q "def get_project_uuid" idse-orchestrator/src/idse_orchestrator/project_manager.py; then
    test_pass "get_project_uuid method exists"
else
    test_fail "get_project_uuid method not found"
fi

if grep -q "def set_project_uuid" idse-orchestrator/src/idse_orchestrator/project_manager.py; then
    test_pass "set_project_uuid method exists"
else
    test_fail "set_project_uuid method not found"
fi

# Test 22: Check mcp_client has pull_blueprint
if grep -q "def pull_blueprint" idse-orchestrator/src/idse_orchestrator/mcp_client.py; then
    test_pass "pull_blueprint method exists"
else
    test_fail "pull_blueprint method not found"
fi

echo ""
echo "========================================"
echo "Test Results"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && python3 -m uvicorn main:app --reload"
    echo "2. Test blueprint list: idse blueprint list"
    echo "3. Test guided init: idse init my-project --guided"
    echo "4. Test sync push: cd .idse/projects/test-blueprint-project && idse sync push"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Review the failures above and fix the issues."
    exit 1
fi
