from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Dict, List


class RoutePreviewTool(BaseTool):
    """
    Debug utility to simulate routing without sending messages.

    Shows:
    - Matching agents
    - Matched keywords
    - Unavailable agents
    """

    message: str = Field(..., description="Message to test for routing matches.")
    routing_table: Dict[str, List[str]] = Field(
        ..., description="Map of agent names to keywords they match on."
    )

    def run(self) -> str:
        msg = self.message.lower()
        report_lines = []

        for agent_name, keywords in self.routing_table.items():
            matched = [kw for kw in keywords if kw in msg]

            if matched:
                status = "✅ Connected" if agent_name in self.agents else "❌ Not connected"
                report_lines.append(
                    f"- {agent_name}: matched {matched} ({status})"
                )

        if not report_lines:
            return "No agents would be routed for this message."

        return "Route preview:\n" + "\n".join(report_lines)


if __name__ == "__main__":
    tool = RoutePreviewTool(
        message="Define tailwind variants and accessibility tests",
        routing_table={
            "ComponentDesigner": ["tailwind", "variant", "component"],
            "TestAgent": ["test", "accessibility", "unit"]
        }
    )
    print(tool.run())
