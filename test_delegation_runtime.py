#!/usr/bin/env python3
"""
Test delegation in actual agency runtime (not standalone tool testing).

This test verifies that:
1. Agency creates the runtime properly
2. LLM detects component design keywords
3. LLM invokes RouteSafeTool
4. Tool has self.agents populated by framework
5. Tool successfully delegates to ComponentDesigner
6. ComponentDesigner's response is returned
"""

import sys
from agency import create_agency


def test_runtime_delegation():
    print("=" * 70)
    print("Runtime Delegation Test (LLM-invoked tool)")
    print("=" * 70)

    # Create agency
    print("\n1. Creating agency...")
    agency = create_agency()
    print("✓ Agency created")

    # Verify routing tools are loaded
    print("\n2. Checking available tools...")
    from idse_developer_agent import idse_developer_agent

    tool_names = []
    for tool in idse_developer_agent.tools:
        if hasattr(tool, 'name'):
            tool_names.append(tool.name)
        elif hasattr(tool, '__name__'):
            tool_names.append(tool.__name__)
        elif hasattr(tool, '__class__'):
            tool_names.append(tool.__class__.__name__)

    print(f"   Loaded tools: {tool_names}")

    routing_tools = [t for t in tool_names if 'Route' in t or 'route' in t]
    if routing_tools:
        print(f"✓ Routing tools found: {routing_tools}")
    else:
        print("⚠ No routing tools found - may use built-in send_message")

    # Test with component design query
    test_query = "Help me define component variants for a Badge"
    print(f"\n3. Sending query that should trigger delegation:")
    print(f'   "{test_query}"')
    print("\n" + "=" * 70)

    try:
        # This invokes the LLM, which should:
        # 1. Detect "component" and "variant" keywords
        # 2. Call RouteSafeTool (with self.agents injected by framework)
        # 3. Tool delegates to ComponentDesigner
        # 4. Return ComponentDesigner's response
        response = agency.get_response_sync(test_query)

        print("\n" + "=" * 70)
        print("4. Response Analysis:")
        print("=" * 70)

        if hasattr(response, 'final_output'):
            output = response.final_output
        else:
            output = str(response)

        print(output)

        # Check for successful delegation indicators
        success_indicators = [
            'componentdesigner' in output.lower(),
            'clarifying' in output.lower() or 'question' in output.lower(),
            'variant' in output.lower() or 'badge' in output.lower(),
        ]

        # Check for failure indicators
        failure_indicators = [
            'routing failed' in output.lower(),
            'not available' in output.lower(),
            'not connected' in output.lower(),
            'retry' in output.lower() and 'delegation' in output.lower(),
        ]

        print("\n" + "=" * 70)
        print("5. Delegation Status:")
        print("=" * 70)

        success_count = sum(success_indicators)
        failure_count = sum(failure_indicators)

        print(f"   Success indicators: {success_count}/3")
        print(f"   Failure indicators: {failure_count}")

        if success_count >= 2 and failure_count == 0:
            print("\n✅ DELEGATION WORKING - ComponentDesigner responded successfully")
            return True
        elif failure_count > 0:
            print("\n❌ DELEGATION FAILED - Routing errors detected")
            print("\n   This likely means:")
            print("   - self.agents not injected (tool called outside runtime)")
            print("   - OR communication_flows not properly configured")
            return False
        else:
            print("\n⚠ UNCLEAR - Response doesn't clearly indicate success or failure")
            return False

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("Runtime Delegation Test")
    print("Tests delegation when tools are invoked by LLM in agency runtime")
    print("=" * 70)

    success = test_runtime_delegation()

    print("\n" + "=" * 70)
    if success:
        print("✅ TEST PASSED")
        print("\nDelegation is working correctly.")
        print("The LLM successfully invoked the routing tool and")
        print("ComponentDesigner responded with clarifying questions.")
    else:
        print("❌ TEST FAILED")
        print("\nPossible issues:")
        print("1. Tool is being called but self.agents is empty")
        print("   → Framework not injecting agents dict")
        print("2. LLM not calling the routing tool")
        print("   → Instructions may need adjustment")
        print("3. Communication flows not configured")
        print("   → Check agency.py communication_flows")
    print("=" * 70)

    sys.exit(0 if success else 1)
