from agency_swarm.tools import BaseTool
from pydantic import Field


class RouteToComponentDesigner(BaseTool):
    """
    Routes component design requests to the ComponentDesigner agent.

    Use this tool when the user asks about:
    - Defining component variants
    - Creating CVA configurations
    - Generating Tailwind variant maps
    - Creating Storybook argTypes
    - Generating Puck CMS fields

    This tool delegates the entire request to ComponentDesigner and returns their response.
    """

    message: str = Field(
        ...,
        description="The user's complete message about component design. Pass it through unchanged."
    )

    def run(self):
        """
        Forwards the message to ComponentDesigner and returns their response.

        The send_message method is automatically injected by Agency Swarm when this tool
        executes within the agency runtime.
        """
        recipient_name = "ComponentDesigner"

        # Diagnostics
        has_agents = hasattr(self, "agents")
        has_send_message = hasattr(self, "send_message")
        available = list(self.agents.keys()) if has_agents and self.agents else []

        debug_lines = [
            "📡 RouteToComponentDesigner activated",
            f"🔧 has 'agents' attr: {has_agents}",
            f"🔧 has 'send_message' attr: {has_send_message}",
            f"🔍 Available agents: {available}",
            f"🧭 Target: {recipient_name}",
        ]

        # Check if send_message is available
        if not has_send_message:
            debug_lines.append("[ERROR] send_message method not injected!")
            debug_lines.append("This means Agency communication flows may not be properly configured.")
            return "\n".join(debug_lines)

        # Check if ComponentDesigner is available
        if recipient_name not in available:
            debug_lines.append(f"[ERROR] Agent '{recipient_name}' not found in agents dict.")
            debug_lines.append(f"Available: {available}")
            return "\n".join(debug_lines)

        # Delegate to ComponentDesigner
        try:
            response = self.send_message(
                recipient=self.agents[recipient_name],
                message=self.message,
            )
            debug_lines.append("✅ send_message succeeded.")
            return "\n".join(debug_lines + [str(response)])
        except Exception as e:
            debug_lines.append(f"[ERROR] send_message failed: {e!r}")
            import traceback
            debug_lines.append(f"Traceback: {traceback.format_exc()}")
            return "\n".join(debug_lines)


if __name__ == "__main__":
    # Test the tool (note: send_message won't work outside agency runtime)
    tool = RouteToComponentDesigner(message="Define component variants for a Button")
    print("Tool created successfully")
    print(f"Message: {tool.message}")
