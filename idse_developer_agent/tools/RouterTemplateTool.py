from typing import Dict, List

from agency_swarm.tools import BaseTool
from pydantic import Field


class RouterTemplateTool(BaseTool):
    """
    Routes messages to specialist agents based on keyword matching.

    This tool enables the IDSE Developer Agent to delegate component design tasks
    to the ComponentDesigner agent. It uses keyword matching to determine routing
    and invokes send_message() within the agency runtime context.
    """

    message: str = Field(
        ...,
        description="The user's complete message to route. Pass it through unchanged."
    )
    routing_table: Dict[str, List[str]] = Field(
        ...,
        description=(
            "Mapping of agent names to keyword lists. "
            "Example: {'ComponentDesigner': ['component', 'variant', 'storybook', 'tailwind', 'puck', 'cva']}"
        ),
    )

    def run(self):
        """
        Analyzes the message and routes to the appropriate agent.

        Returns the specialist agent's response, or an error message if routing fails.
        """
        msg_lower = self.message.lower()

        # Find matching agent
        for agent_name, keywords in self.routing_table.items():
            if any(keyword in msg_lower for keyword in keywords):
                # Check if agent is available in runtime
                if not hasattr(self, 'agents') or self.agents is None:
                    return (
                        f"Routing failed: Agency runtime not available. "
                        f"Cannot delegate to {agent_name}."
                    )

                if agent_name not in self.agents:
                    available = list(self.agents.keys()) if self.agents else []
                    return (
                        f"Routing failed: Agent '{agent_name}' not found. "
                        f"Available agents: {available}"
                    )

                # Delegate to specialist agent
                try:
                    return self.send_message(
                        recipient=self.agents[agent_name],
                        message=self.message,
                    )
                except Exception as e:
                    return (
                        f"Routing failed: Error sending message to {agent_name}.\n"
                        f"Error: {e!r}\n\n"
                        "You can try again or manually rephrase the request."
                    )

        # No matching route found
        return (
            "No routing rule matched. This message will be handled by the current agent.\n"
            f"Routing table: {self.routing_table}"
        )


if __name__ == "__main__":
    # Test the tool (note: send_message won't work outside agency runtime)
    tool = RouterTemplateTool(
        message="Define component variants for a Button",
        routing_table={
            "ComponentDesigner": ["component", "variant", "storybook", "tailwind", "puck", "cva"]
        },
    )
    print("Tool created successfully")
    print(f"Message: {tool.message}")
    print(f"Routing table: {tool.routing_table}")
