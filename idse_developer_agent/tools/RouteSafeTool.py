from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Dict, List


class RouteSafeTool(BaseTool):
    """
    Safe and fault-tolerant agent routing tool. Delegates messages to a recipient
    agent based on keyword matching and prevents crashes if routing fails.

    - Checks for agent availability
    - Wraps routing in try/except
    - Returns fallback response if delegation is not possible
    """

    message: str = Field(..., description="The user message to analyze and route.")
    routing_table: Dict[str, List[str]] = Field(
        ...,
        description="Mapping of agent names to keyword lists for routing."
    )

    def run(self) -> str:
        msg = self.message.lower()

        try:
            for agent_name, keywords in self.routing_table.items():
                if any(keyword in msg for keyword in keywords):
                    if agent_name not in self.agents:
                        return (
                            f"Routing failed: agent '{agent_name}' is not connected "
                            "via communication_flows. Please check your agency setup."
                        )

                    return self.send_message(
                        recipient=self.agents[agent_name],
                        message=self.message
                    )

            return "No routing rule matched. I'll handle this message myself."
        except Exception as e:
            return (
                f"⚠️ Routing failed due to an unexpected error.\n\n"
                f"Message: '{self.message}'\n"
                f"Error: {str(e)}\n\n"
                "You can try again, or rephrase the message to clarify the request."
            )


if __name__ == "__main__":
    tool = RouteSafeTool(
        message="Define variants for a card component",
        routing_table={
            "ComponentDesigner": ["component", "variant", "tailwind", "storybook", "puck"]
        }
    )
    print(tool.run())
