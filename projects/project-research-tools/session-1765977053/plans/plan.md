# Implementation Plan
# Plan: Project Research Tools (session-1765977053)

## Goal
Enable Firecrawl MCP as a hosted tool in the IDSE Developer Agent, update instructions, and ensure session-scoped outputs for `project-research-tools` without violating guardrails.

## Assumptions / Open Items [REQUIRES INPUT]
- `FIRECRAWL_API_KEY` is available in `.env`.
- Default output stage/filename for Firecrawl runs (context vs spec).
- Whether to move the research-tools folder under `implementation/projects/project-research-tools/sessions/session-1765977053/`.
- Network access may need approval to test live Firecrawl calls.

## Phases and Tasks

### Phase 0: Prereqs and Alignment
- Verify `.env` contains `FIRECRAWL_API_KEY`; document if missing.
- Decide default output path/stage for Firecrawl (e.g., context: `firecrawl.md`).
- (Optional) Relocate `implementation/projects/project-research-tools/` into the session folder to align artifacts.

### Phase 1: Wire Firecrawl MCP Tool
- Add HostedMCPTool pointing to `https://mcp.firecrawl.dev/mcp`, loading `FIRECRAWL_API_KEY`, placed in the agent’s `tools` list (not `mcp_servers`).
- Ensure `load_dotenv()` runs before tool init (already in startup).

### Phase 2: Instructions Update
- Update `idse_developer_agent/instructions.md` to note Firecrawl MCP availability and intended use during Intent/Context/Spec/Plan for structured scraping.

### Phase 3: Output Handling
- Set default session-scoped output path/filename for Firecrawl runs (context by default).
- Ensure errors are persisted to the same session file for traceability.

### Phase 4: Validation
- List tools to confirm Firecrawl MCP appears.
- If allowed, run a sample Firecrawl call (with approval if needed) and confirm output lands in the chosen session path.
- Check for governance boundary compliance (no `/current`, no out-of-scope writes).

## Acceptance Checks
- Firecrawl MCP tools are available to the agent.
- Outputs/errors land in session-scoped files for this project/session.
- Instructions mention Firecrawl MCP usage.
- No guardrail or boundary violations observed.
