import os

from agency_swarm import Agent, ModelSettings

from .tools import (
    CvaVariantsToArgTypesTool,
    CvaVariantsToPuckFieldsTool,
    CvaVariantsToSafelistTool,
)


_HERE = os.path.dirname(__file__)


component_designer_agent = Agent(
    name="ComponentDesigner",
    description=(
        "Helps developers define CVA-based UI component configurations and keeps "
        "Puck fields, Storybook argTypes, and Tailwind safelist entries in sync."
    ),
    instructions=os.path.join(_HERE, "instructions.md"),
    tools=[
        CvaVariantsToPuckFieldsTool,
        CvaVariantsToArgTypesTool,
        CvaVariantsToSafelistTool,
    ],
    model="gpt-4o-mini",
    model_settings=ModelSettings(
        max_output_tokens=600,
    ),
    # NOT an entry point - only accessible via delegation from IDSEDeveloper
)
