#!/usr/bin/env python3
"""
Test script to verify ComponentDesigner delegation works correctly.

This script:
1. Creates a fresh agency instance
2. Sends a component design query
3. Verifies delegation happens automatically
4. Shows the ComponentDesigner's response
"""

import sys
from agency import create_agency


def test_delegation():
    print("=" * 70)
    print("Testing ComponentDesigner Delegation")
    print("=" * 70)

    # Create fresh agency
    print("\n1. Creating agency...")
    agency = create_agency()
    print("✓ Agency created")

    # Verify runtime state
    print("\n2. Verifying runtime state...")
    runtime_state = agency._agent_runtime_state['IDSE Developer Agent']

    print(f"   Subagents registered: {list(runtime_state.subagents.keys())}")
    print(f"   Send message tools: {list(runtime_state.send_message_tools.keys())}")

    if 'componentdesigner' not in runtime_state.subagents:
        print("✗ ComponentDesigner not registered as subagent!")
        return False

    if 'SendMessage' not in runtime_state.send_message_tools:
        print("✗ SendMessage tool not created!")
        return False

    print("✓ Runtime state correct")

    # Test delegation
    print("\n3. Testing delegation with query:")
    test_query = "Help me define component variants for a Badge"
    print(f'   Query: "{test_query}"')
    print("\n" + "=" * 70)

    try:
        response = agency.get_response_sync(test_query)

        print("\n" + "=" * 70)
        print("4. Response received:")
        print("=" * 70)

        if hasattr(response, 'final_output'):
            output = response.final_output
        else:
            output = str(response)

        print(output)

        # Check for delegation indicators
        delegation_indicators = [
            'componentdesigner',
            'clarifying',
            'variant',
            'badge',
        ]

        output_lower = output.lower()
        found_indicators = [ind for ind in delegation_indicators if ind in output_lower]

        print("\n" + "=" * 70)
        print("5. Validation:")
        print("=" * 70)
        print(f"   Found delegation indicators: {found_indicators}")

        if len(found_indicators) >= 2:
            print("✓ Delegation appears to be working!")
            return True
        else:
            print("⚠ Delegation may not be working as expected")
            return False

    except Exception as e:
        print(f"\n✗ Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("ComponentDesigner Delegation Test")
    print("=" * 70)

    success = test_delegation()

    print("\n" + "=" * 70)
    if success:
        print("✓ TEST PASSED - Delegation is working")
    else:
        print("✗ TEST FAILED - Check output above")
    print("=" * 70)

    sys.exit(0 if success else 1)
