from agency_swarm.tools import BaseTool
from pydantic import Field


class LastAgentInspectorTool(BaseTool):
    """
    Utility tool to return the name of the last agent who responded in the conversation.
    Pass the agent name in from the orchestrator or CLI for quick debugging.
    """

    last_agent_name: str = Field(
        ..., description="Name of the last agent that handled the message."
    )

    def run(self) -> str:
        return f"The last agent that handled the message was: **{self.last_agent_name}**"


if __name__ == "__main__":
    tool = LastAgentInspectorTool(last_agent_name="ComponentDesigner")
    print(tool.run())
