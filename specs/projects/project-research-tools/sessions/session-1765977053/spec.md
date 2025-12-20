# Spec: Project Research Tools (session-1765977053)

## Overview
Integrate Firecrawl as a hosted MCP tool for the IDSE Developer Agent to provide structured scraping (docs/URLs/repo pages) during Intent/Context/Spec/Plan stages, writing outputs to session-scoped artifacts under `project-research-tools`.

## Requirements
1) Hosted MCP integration
   - Register Firecrawl MCP via HostedMCPTool pointing to `https://mcp.firecrawl.dev/mcp`.
   - Load `FIRECRAWL_API_KEY` from environment; no hardcoding.
   - Ensure `load_dotenv()` is called before tool initialization (already present).
2) Instructions update
   - Add brief guidance in `idse_developer_agent/instructions.md` indicating Firecrawl MCP tools are available for scraping structured web content and can be used during Intent/Context/Spec/Plan.
3) Session-scoped outputs
   - Default Firecrawl outputs to session-scoped paths under this project/session (e.g., `contexts/.../firecrawl.md` or `specs/.../firecrawl.md`).
   - Persist errors to the same path for traceability.
4) Compatibility with existing scraper suite
   - Keep existing scraper suite intact; Firecrawl MCP should coexist and not break other scraper tools.
5) Governance and guardrails
   - No autopilot; explicit calls only.
   - Respect IDSE sequencing and boundary rules; no `/current` paths.

## Non-Functional
- Security: secrets via env only; do not log API keys.
- Reliability: handle Firecrawl failures gracefully and record the error output in the session file.
- Usability: tools should appear in the agent’s tool list; instructions should make availability clear.
- Scope: keep changes minimal (agent wiring + instructions note + path defaults).

## Interfaces / Config
- Firecrawl MCP endpoint: `https://mcp.firecrawl.dev/mcp`
- Env var: `FIRECRAWL_API_KEY`
- Tool registration: HostedMCPTool in agent configuration (`idse_developer_agent/__init__.py` or equivalent).
- Output paths: session-scoped under `project-research-tools/sessions/session-1765977053/` (stage-specific filenames OK).

## Data / Storage
- Artifact writes only to session-scoped markdown files (context/spec/plan as needed).
- Error responses also written to the same session file for traceability.

## Acceptance Criteria
- Firecrawl MCP tools are listed/usable by the agent.
- Firecrawl requests succeed with the env API key; failures are captured to session-scoped files.
- Instructions mention Firecrawl MCP availability and intended use during early IDSE stages.
- No governance or boundary violations; no writes outside session/project scope.

## Open Questions [REQUIRES INPUT]
- Confirm preferred default stage/filename for Firecrawl outputs (context vs spec).
- Confirm `FIRECRAWL_API_KEY` presence in `.env`.
- Should we relocate the research-tools folder into `implementation/projects/project-research-tools/sessions/session-1765977053/`?
