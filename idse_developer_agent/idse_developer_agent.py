from agency_swarm import Agent, ModelSettings
from openai.types.shared import Reasoning

from .guardrails import (
    instruction_extraction_guardrail,
    instruction_leakage_guardrail,
    idse_boundary_guardrail,
)


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
    # Guardrails: Instruction protection and boundary enforcement
    input_guardrails=[
        instruction_extraction_guardrail,
        idse_boundary_guardrail,
    ],
    output_guardrails=[
        instruction_leakage_guardrail,
    ],
    validation_attempts=2,  # Allow one retry on output guardrail failure
    throw_input_guardrail_error=True,  # Strict mode: fail fast on input violations
)
