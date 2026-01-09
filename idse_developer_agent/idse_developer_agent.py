import os
import asyncio

from agency_swarm import Agent, HostedMCPTool, ModelSettings
from openai.types.shared import Reasoning
from dotenv import load_dotenv

from .guardrails import (
    instruction_extraction_guardrail,
    instruction_leakage_guardrail,
    idse_boundary_guardrail,
)
load_dotenv()

_firecrawl_api_key = os.getenv("FIRECRAWL_API_KEY", "")
# Temporarily disabled due to service availability issues (HTTP 424)
# firecrawl_mcp = HostedMCPTool(
#     tool_config={
#         "type": "mcp",
#         "server_label": "firecrawl",
#         "server_url": "https://mcp.firecrawl.dev/mcp",
#         "require_approval": "never",
#         "headers": {
#             "Authorization": f"Bearer {_firecrawl_api_key}",
#         },
#     }
# )


idse_developer_agent = Agent(
    name="IDSE Developer Agent",
    description="Autonomous agent executing the Intent-Driven Systems Engineering pipeline with constitutional safeguards",
    instructions="./instructions.md",
    files_folder="./files",
    tools_folder="./tools",
    # Handoffs managed by Agency communication_flows - creates transfer_to_ComponentDesigner tool
    model="gpt-4o-mini",
    model_settings=ModelSettings(
        max_output_tokens=400,
    ),
    # Guardrails: Instruction protection and boundary enforcement
    input_guardrails=[
        instruction_extraction_guardrail,
        idse_boundary_guardrail,
    ],
    output_guardrails=[
        instruction_leakage_guardrail,
    ],
    validation_attempts=1,  # No retry: fail fast on guardrail violations
    throw_input_guardrail_error=True,  # Strict mode: fail fast on input violations
)


if __name__ == "__main__":  # Optional Firecrawl MCP connectivity check
    async def test_firecrawl():
        print("Connecting to Firecrawl MCP server...")
        for tool in idse_developer_agent.tools:
            if hasattr(tool, "connect") and hasattr(tool, "list_tools"):
                try:
                    await tool.connect()
                    available = await tool.list_tools()
                    print("\nFirecrawl Tools:")
                    for t in available:
                        print(f" - {t.name}: {t.description}")
                except Exception as exc:
                    print(f"Unable to list Firecrawl tools: {exc}")

        try:
            result = await idse_developer_agent.get_response(
                "Use firecrawl to scrape the content of https://example.com"
            )
            print("\nAgent response:\n", getattr(result, "final_output", result))
        except Exception as exc:
            print(f"Sample Firecrawl query failed: {exc}")

    asyncio.run(test_firecrawl())
