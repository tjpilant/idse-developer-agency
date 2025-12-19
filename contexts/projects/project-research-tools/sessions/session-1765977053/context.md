# Project: Project Research Tools
# Session: session-1765977053

## Context Summary
- We need Firecrawl MCP integrated as a hosted tool to supply structured scraping (docs, URLs, install steps, API/CLI examples) across IDSE stages.
- Current codebase already includes a scraper suite (Firecrawl HTTP tool, GitHub repo scraper, docs scraper, dispatcher) but Firecrawl MCP (HostedMCPTool) is not yet wired into the agent or instructions.
- Active session set to `project-research-tools` / `session-1765977053`; research-tools folder currently resides at `implementation/projects/project-research-tools/` (not yet session-scoped).

## Sources / Inputs
- Firecrawl MCP endpoint: `https://mcp.firecrawl.dev/mcp`
- API key env var: `FIRECRAWL_API_KEY` (status unknown; needs confirmation in `.env`)
- Existing scraper suite modules: `idse_developer_agent/tools/scraper_suite/`
- IDSE instructions and guardrails: `idse_developer_agent/instructions.md`, `docs/02-idse-constitution.md`, `docs/03-idse-pipeline.md`

## Constraints
- Follow IDSE stage order; no autopilot. Writes must be session/project scoped (no `/current`).
- Secrets via environment only (`FIRECRAWL_API_KEY`); no hardcoding.
- Respect governance boundaries (no edits in `idse-governance/` outside protocols; avoid boundary violations).

## Environment / Dependencies
- Agent uses Agency Swarm; tools registered via `idse_developer_agent/__init__.py` or agent config.
- `.env` should include `FIRECRAWL_API_KEY`; `load_dotenv()` already called in startup.
- Network access is restricted; Firecrawl calls may require approval depending on sandbox.

## Gaps / Unknowns [REQUIRES INPUT]
- Confirm `FIRECRAWL_API_KEY` presence and value.
- Preferred default output stage/file for Firecrawl runs (e.g., context.md vs spec.md) and naming convention.
- Whether to relocate the research-tools folder into `implementation/projects/project-research-tools/sessions/session-1765977053/`.
- Any additional MCP servers to queue after Firecrawl.

## Risks / Considerations
- Without API key, Firecrawl MCP will fail; ensure error handling preserves trace logs in session paths.
- Need to ensure hosted MCP tool is registered in `tools` (not `mcp_servers`) and instructions mention availability.
- Sandbox/network restrictions may block live calls; may need approval or fallback stubs for tests.
