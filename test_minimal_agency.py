#!/usr/bin/env python3
"""
Minimal test to see how Agency Swarm creates SendMessage tools
"""

import asyncio
from agency_swarm import Agency, Agent
from agency_swarm.tools.send_message import SendMessageHandoff

# Create two minimal agents with NO custom tools
agent1 = Agent(
    name="Agent1",
    description="First agent",
    instructions="You are Agent1. When the user mentions 'component', transfer to Agent2.",
    model="gpt-4o-mini",
)

agent2 = Agent(
    name="Agent2",
    description="Second agent - component specialist",
    instructions="You are Agent2, a component design specialist.",
    model="gpt-4o-mini",
)

# Create agency with communication flows and SendMessageHandoff
agency = Agency(
    agent1,
    communication_flows=[
        (agent1, agent2),
        (agent2, agent1),
    ],
    send_message_tool_class=SendMessageHandoff,
)

async def test():
    print("Agency created")
    print(f"Agents: {list(agency.agents.keys())}")

    # Check runtime state
    runtime_state = agency.get_agent_runtime_state("Agent1")
    print(f"\nAgent1 runtime state:")
    print(f"  subagents: {list(runtime_state.subagents.keys())}")
    print(f"  send_message_tools: {list(runtime_state.send_message_tools.keys())}")
    print(f"  handoffs: {list(runtime_state.handoffs.keys())}")

    # Try to get a response
    print("\nSending test message...")
    result = await agency.get_response(
        "Help me with a component design",
        agent_name="Agent1"
    )

    print("\nResponse:")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(test())
