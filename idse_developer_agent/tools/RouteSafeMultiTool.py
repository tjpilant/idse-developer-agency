from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Dict, List


class RouteSafeMultiTool(BaseTool):
    """
    Routes a message to all agents whose keywords match.

    Supports:
    - Multi-agent broadcast (all relevant agents)
    - Communication safety (only sends to reachable agents)
    - Graceful fallback and summary output
    """

    message: str = Field(..., description="The user message to analyze and route.")
    routing_table: Dict[str, List[str]] = Field(
        ...,
        description="Mapping of agent names to keyword lists."
    )

    def run(self) -> str:
        msg = self.message.lower()
        responses = []
        matched_any = False

        try:
            for agent_name, keywords in self.routing_table.items():
                if any(keyword in msg for keyword in keywords):
                    matched_any = True

                    if agent_name not in self.agents:
                        responses.append(f"❌ Agent '{agent_name}' is not connected.")
                        continue

                    result = self.send_message(
                        recipient=self.agents[agent_name],
                        message=self.message
                    )
                    responses.append(f"✅ Routed to '{agent_name}':\n{result}\n")

            if not matched_any:
                return "No agents matched this message. I'll handle it locally."

            return "\n".join(responses)

        except Exception as e:
            return (
                f"⚠️ Routing failed with error: {str(e)}\n"
                "You can retry or route manually."
            )


if __name__ == "__main__":
    tool = RouteSafeMultiTool(
        message="Define Tailwind variants for a component and generate tests.",
        routing_table={
            "ComponentDesigner": ["component", "tailwind", "variant", "storybook"],
            "TestAgent": ["test", "unit", "snapshot", "accessibility"]
        }
    )
    print(tool.run())
