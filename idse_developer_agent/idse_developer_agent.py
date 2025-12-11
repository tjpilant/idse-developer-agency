from agency_swarm import Agent, ModelSettings
from openai.types.shared import Reasoning


idse_developer_agent = Agent(
    name="IDSE Developer Agent",
    description="Autonomous agent executing the Intent-Driven Systems Engineering pipeline with constitutional safeguards",
    instructions="./instructions.md",
    files_folder="./files",
    tools_folder="./tools",
    model="gpt-5.1",
    model_settings=ModelSettings(
        reasoning=Reasoning(effort="medium", summary="auto"),
    ),
)
