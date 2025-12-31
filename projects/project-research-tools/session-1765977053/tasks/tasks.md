# Tasks: Project Research Tools (session-1765977053)

## Phase 0 – Prereqs and Alignment
- [x] Check `.env` for `FIRECRAWL_API_KEY`; document status. (set)
- [ ] Decide default Firecrawl output target (stage + filename, e.g., context: `firecrawl.md`). [REQUIRES INPUT]
- [x] (Optional) Move `implementation/projects/project-research-tools/` into `implementation/projects/project-research-tools/sessions/session-1765977053/` to align artifacts. (done)

## Phase 1 – Wire Firecrawl MCP Tool
- [x] Add HostedMCPTool pointing to `https://mcp.firecrawl.dev/mcp` in the agent’s `tools` list, loading `FIRECRAWL_API_KEY` (no hardcoding).
- [x] Ensure `load_dotenv()` runs before tool init (already present; verify no regressions).

## Phase 2 – Instructions Update
- [x] Update `idse_developer_agent/instructions.md` to note Firecrawl MCP availability and use during Intent/Context/Spec/Plan for structured scraping.

## Phase 3 – Output Handling
- [x] Set default session-scoped output path/filename for Firecrawl runs (context: `firecrawl.md`); errors persist to the same file.

## Phase 4 – Validation
- [x] List tools to confirm Firecrawl MCP appears (no boundary violations).
- [x] If approved and network-allowed, run a sample Firecrawl call and confirm output lands in the chosen session path (manual run succeeded against example.com).

## Phase 5 – Cleanup
- [ ] Deprecate or migrate `AnalyzeGitHubRepoTool.py` to `scraper_suite/GitHubRepoScraper` (token-aware, session-scoped); remove from any registrations if present.

## Phase 6 – Dispatcher & Scraper Enhancements
- [ ] Add Firecrawl MCP helper for dispatcher (direct call with `FIRECRAWL_API_KEY`).
- [ ] Implement LocalDocsScraper for local markdown/docs paths (session-scoped output).
- [ ] Update ScraperDispatcherTool to auto-route: GitHub URLs → GitHubRepoScraper; http(s) non-GitHub → Firecrawl helper; local paths → LocalDocsScraper.
- [ ] Optionally add GitHub token/User-Agent and metadata (stars/forks/topics) to GitHubRepoScraper.
