#!/usr/bin/env python3
"""
Direct test of the RouteToComponentDesigner tool to see diagnostic output
"""

import asyncio
from agency import create_agency

async def test_direct():
    print("Creating agency...")
    agency = create_agency()

    print("\nAgents in agency:")
    for name in agency.agents.keys():
        print(f"  - {name}")

    print("\nSending test message...")
    result = await agency.get_response(
        "Help me define component variants for a Button",
        agent_name="IDSE Developer Agent"
    )

    print("\n" + "="*70)
    print("RESPONSE:")
    print("="*70)

    # Try to extract the actual tool output
    if hasattr(result, 'new_items'):
        print(f"\nNew items ({len(result.new_items)}):")
        for i, item in enumerate(result.new_items, 1):
            print(f"\n--- Item {i} ---")
            print(f"Type: {type(item)}")
            if hasattr(item, 'content'):
                print(f"Content: {item.content}")
            elif hasattr(item, '__dict__'):
                print(f"Attrs: {item.__dict__}")
            else:
                print(f"Value: {item}")

    print(f"\nFinal output:\n{result.final_output}")

if __name__ == "__main__":
    asyncio.run(test_direct())
