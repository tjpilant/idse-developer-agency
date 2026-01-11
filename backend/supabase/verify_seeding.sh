#!/bin/bash
# Verification Script for Supabase Project Seeding
# Run after executing 006_seed_all_projects.sql

API_BASE="http://localhost:8000"

echo "=========================================="
echo "Supabase Project Seeding Verification"
echo "=========================================="
echo ""

# Check if backend is running
if ! curl -s -o /dev/null -w "%{http_code}" ${API_BASE}/api/projects/ | grep -q "200"; then
  echo "❌ ERROR: Backend is not running on port 8000"
  echo "   Start with: python3 -m uvicorn backend.main:app --reload"
  exit 1
fi

echo "✅ Backend is running"
echo ""

# Test 1: List all projects
echo "Test 1: List All Projects"
echo "-------------------------"
PROJECTS=$(curl -s ${API_BASE}/api/projects/ | jq -r '.projects[]')
PROJECT_COUNT=$(echo "$PROJECTS" | wc -l)

echo "Total Projects: $PROJECT_COUNT"
echo "Projects:"
echo "$PROJECTS" | sed 's/^/  - /'
echo ""

# Expected projects
EXPECTED_PROJECTS=(
  "IDSE_Core"
  "Puck_Docs"
  "Puck_Editor_Research"
  "RemapTest"
  "TestBootstrap"
  "default"
  "project-research-tools"
)

# Check if all expected projects exist
MISSING_COUNT=0
for proj in "${EXPECTED_PROJECTS[@]}"; do
  if ! echo "$PROJECTS" | grep -q "^${proj}$"; then
    echo "❌ Missing project: ${proj}"
    ((MISSING_COUNT++))
  fi
done

if [ $MISSING_COUNT -eq 0 ]; then
  echo "✅ All expected projects found"
else
  echo "❌ $MISSING_COUNT project(s) missing"
fi
echo ""

# Test 2: Check sessions for each project
echo "Test 2: Session Counts Per Project"
echo "-----------------------------------"

declare -A EXPECTED_SESSIONS
EXPECTED_SESSIONS[IDSE_Core]=9
EXPECTED_SESSIONS[Puck_Docs]=2
EXPECTED_SESSIONS[Puck_Editor_Research]=2
EXPECTED_SESSIONS[RemapTest]=1
EXPECTED_SESSIONS[TestBootstrap]=1
EXPECTED_SESSIONS[default]=1
EXPECTED_SESSIONS[project-research-tools]=0

TOTAL_SESSIONS=0
MISMATCHES=0

for proj in "${!EXPECTED_SESSIONS[@]}"; do
  SESSION_COUNT=$(curl -s ${API_BASE}/api/projects/${proj}/sessions 2>/dev/null | jq -r '.sessions | length' 2>/dev/null || echo "0")
  EXPECTED=${EXPECTED_SESSIONS[$proj]}
  TOTAL_SESSIONS=$((TOTAL_SESSIONS + SESSION_COUNT))

  if [ "$SESSION_COUNT" -eq "$EXPECTED" ]; then
    echo "✅ ${proj}: ${SESSION_COUNT} sessions (expected ${EXPECTED})"
  else
    echo "❌ ${proj}: ${SESSION_COUNT} sessions (expected ${EXPECTED})"
    ((MISMATCHES++))
  fi
done

echo ""
echo "Total Sessions: $TOTAL_SESSIONS (expected 16)"
echo ""

# Test 3: Sample a few specific sessions
echo "Test 3: Sample Session Retrieval"
echo "---------------------------------"

# Test IDSE_Core/milkdown-crepe-v2 (newly seeded)
echo "Testing: IDSE_Core/milkdown-crepe-v2"
RESULT=$(curl -s ${API_BASE}/api/projects/IDSE_Core/sessions | jq -r '.sessions[] | select(.session_id=="milkdown-crepe-v2") | .name')
if [ -n "$RESULT" ]; then
  echo "✅ Found: $RESULT"
else
  echo "❌ Not found"
fi

# Test Puck_Docs/session-01
echo "Testing: Puck_Docs/session-01"
RESULT=$(curl -s ${API_BASE}/api/projects/Puck_Docs/sessions | jq -r '.sessions[] | select(.session_id=="session-01") | .name')
if [ -n "$RESULT" ]; then
  echo "✅ Found: $RESULT"
else
  echo "❌ Not found"
fi

# Test RemapTest/remap-session
echo "Testing: RemapTest/remap-session"
RESULT=$(curl -s ${API_BASE}/api/projects/RemapTest/sessions | jq -r '.sessions[] | select(.session_id=="remap-session") | .name')
if [ -n "$RESULT" ]; then
  echo "✅ Found: $RESULT"
else
  echo "❌ Not found"
fi

echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="

if [ $MISSING_COUNT -eq 0 ] && [ $MISMATCHES -eq 0 ]; then
  echo "✅ ALL TESTS PASSED"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  exit 1
fi
