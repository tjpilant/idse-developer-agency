#!/bin/bash
# IDSE Governance Layer Validation Script
# Purpose: Ensure governance layer integrity and boundary enforcement

set -e

echo "🔍 Validating IDSE Governance Layer..."
echo ""

# Check 1: Governance layer notice presence
echo "✓ Checking for Governance Layer Notice..."
if grep -R "GOVERNANCE LAYER NOTICE" idse-governance/ >/dev/null 2>&1; then
  echo "  ✔ Governance layer notice found"
else
  echo "  ⚠ Governance notice missing or misplaced"
  exit 1
fi

# Check 2: Layer marker file exists
echo "✓ Checking .idse-layer marker..."
if [ -f ".idse-layer" ]; then
  echo "  ✔ Layer marker file exists"
else
  echo "  ✗ .idse-layer marker file missing"
  exit 1
fi

# Check 3: Governance config exists
echo "✓ Checking governance config..."
if [ -f ".cursor/config/idse-governance.json" ]; then
  echo "  ✔ Governance config exists"
else
  echo "  ✗ .cursor/config/idse-governance.json missing"
  exit 1
fi

# Check 4: State file in correct location
echo "✓ Checking state file location..."
if [ -f "idse-governance/state/state.json" ]; then
  echo "  ✔ State file in governance layer"
else
  echo "  ✗ State file not in idse-governance/state/"
  exit 1
fi

# Check 5: No governance files in protected paths
echo "✓ Checking for governance artifacts in protected paths..."
VIOLATIONS=0
for path in "src/" "lib/" "app/" "idse_developer_agent/" "implementation/"; do
  if [ -d "$path" ]; then
    if grep -R "handoff_protocol\|GOVERNANCE LAYER" "$path" >/dev/null 2>&1; then
      echo "  ⚠ Found governance artifacts in protected path: $path"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done

if [ $VIOLATIONS -eq 0 ]; then
  echo "  ✔ No governance artifacts in protected paths"
else
  echo "  ✗ Found $VIOLATIONS violation(s)"
  exit 1
fi

# Check 6: Old docs/protocols references
echo "✓ Checking for old docs/protocols references..."
if [ -d "docs/protocols" ]; then
  echo "  ⚠ Old docs/protocols directory still exists (consider archiving)"
fi

echo ""
echo "✅ IDSE Governance Layer validation passed!"
echo ""
echo "Summary:"
echo "  - Governance layer notice: ✔"
echo "  - Layer marker: ✔"
echo "  - Config file: ✔"
echo "  - State file location: ✔"
echo "  - Protected paths clean: ✔"
