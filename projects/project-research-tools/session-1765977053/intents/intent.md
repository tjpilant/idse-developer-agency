# Intent

## Overview
Project: Project Research Tools

## Intent Summary
Integrate Firecrawl (MCP hosted endpoint) into the IDSE Developer Agent to provide structured scraping during the IDSE pipeline (Intent → Context → Spec → Plan → Implementation → Feedback). Enable the agent to pull structured content (install steps, API/CLI examples, links) from URLs and save outputs into session-scoped artifacts.

## Purpose
- Improve context/spec quality by scraping docs, repos, and product pages via Firecrawl MCP.
- Keep outputs governed and session-scoped; no autopilot or out-of-band writes.
- Make Firecrawl tools discoverable and usable as standard tools in the agent.

## Outcome
- Agent can call Firecrawl MCP tools (hosted at `https://mcp.firecrawl.dev/mcp`) with `FIRECRAWL_API_KEY`.
- Scraped content lands in the appropriate stage files (intent/context/spec/plan) for this project/session.
- `instructions.md` notes Firecrawl availability and usage guidance.
- No governance violations; IDSE sequencing preserved.

## Current State / Starting Point
- Active session: `session-1765977053`, project `project-research-tools`.
- Firecrawl MCP not yet wired into the agent; `.env` may need `FIRECRAWL_API_KEY`.
- Scraper suite code exists (Firecrawl tool + GitHub/docs scrapers), but Firecrawl MCP tool registration and instructions update are pending.
- Research tools folder exists under `implementation/projects/project-research-tools/` (not yet session-scoped).

## Objectives
- Add HostedMCPTool for Firecrawl MCP to the agent, loading `FIRECRAWL_API_KEY` from environment.
- Update agent instructions to mention Firecrawl MCP tools and their use during Intent/Context/Spec/Plan.
- Ensure outputs are written via session-scoped paths for this project/session.
- Keep guardrails (no autopilot, respect IDSE stage order, boundary enforcement).

## In Scope (v1)
- Hosted MCP integration for Firecrawl (scrape/extract structured content).
- Session-scoped output writing to this project/session.
- Instruction update to make Firecrawl tools visible to the agent.

## Out of Scope (v1)
- Non-Firecrawl MCP servers.
- Complex dispatchers beyond existing scraper suite.
- Broad UI changes; focus on agent/tool integration.

## Constraints & Principles
- Follow IDSE sequence; do not advance stages without confirmation.
- No `/current` paths; all writes must be session/project scoped.
- Use environment variables for secrets (`FIRECRAWL_API_KEY`); no hardcoding.
- Respect governance guardrails and ownership markers.

## Success Criteria
- Agent lists Firecrawl MCP tools and can invoke them successfully.
- Scraped outputs are persisted to the correct session-scoped stage files.
- Instructions reflect Firecrawl availability and usage cues.
- Integration causes no boundary or guardrail violations.

## Open Questions [REQUIRES INPUT]
- Confirm `FIRECRAWL_API_KEY` presence in `.env`.
- Preferred default stage/filenames for scraped outputs (context vs spec).
- Whether to move the research-tools folder into `implementation/projects/project-research-tools/sessions/session-1765977053/`.
- Any additional MCP servers to queue for later phases.
