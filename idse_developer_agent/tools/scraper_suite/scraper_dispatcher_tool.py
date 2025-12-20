from __future__ import annotations

from typing import List, Optional
from urllib.parse import urlparse

from agency_swarm.tools import BaseTool
from pydantic import Field

from idse_developer_agent.tools.scraper_suite.docs_site_scraper import DocsSiteScraper
from idse_developer_agent.tools.scraper_suite.firecrawl_mcp_helper import call_firecrawl_scrape
from idse_developer_agent.tools.scraper_suite.github_repo_scraper import GitHubRepoScraper
from idse_developer_agent.tools.scraper_suite.local_docs_scraper import LocalDocsScraper


class ScraperDispatcherTool(BaseTool):
    """
    Route scrape requests to the appropriate scraper tool.
    """

    name: str = "ScraperDispatcherTool"
    scraper: Optional[str] = Field(
        default=None,
        description="Which scraper to use: firecrawl | github_repo | docs_site | autodetect (default).",
    )
    url: str = Field(
        default="",
        description="URL or local path to scrape.",
    )
    # Firecrawl options
    firecrawl_mode: str = Field(
        default="scrape",
        description="Firecrawl mode: scrape or crawl (used when scraper=firecrawl).",
    )
    depth: int = Field(
        default=1,
        description="Crawl depth when scraper=firecrawl and mode=crawl.",
        ge=1,
        le=5,
    )
    # GitHub options
    branch: str = Field(default="main", description="Branch to fetch when scraper=github_repo.")
    max_files: int = Field(
        default=50,
        description="Max files to include when scraper=github_repo.",
    )
    # Docs site options
    paths: List[str] = Field(
        default_factory=list,
        description="Optional relative paths when scraper=docs_site.",
    )

    # Common options
    output_path: Optional[str] = Field(
        default=None,
        description="Optional explicit output path. Defaults to session-scoped stage path.",
    )
    stage: str = Field(
        default="context",
        description="IDSE stage to place output (intent/context/spec/plan/tasks). Defaults to context.",
    )
    project: Optional[str] = Field(
        default=None,
        description="Optional project override. Uses active project when omitted.",
    )
    api_key: Optional[str] = Field(
        default=None,
        description="Firecrawl API key override (scraper=firecrawl only).",
    )

    def run(self) -> str:
        target = (self.scraper or "").lower().strip()
        if not target:
            parsed = urlparse(self.url)
            if parsed.scheme in {"http", "https"}:
                if "github.com" in parsed.netloc:
                    target = "github_repo"
                else:
                    target = "firecrawl"
            else:
                target = "local_docs"

        if target == "firecrawl":
            return call_firecrawl_scrape(
                url=self.url,
                include_mco=True,
                stage=self.stage,
                output_path=self.output_path,
                project=self.project,
            )
        if target == "github_repo":
            tool = GitHubRepoScraper(
                repo_url=self.url,
                branch=self.branch,
                max_files=self.max_files,
                output_path=self.output_path,
                stage=self.stage,
                project=self.project,
            )
            return tool.run()
        if target == "docs_site":
            tool = DocsSiteScraper(
                base_url=self.url,
                paths=self.paths,
                output_path=self.output_path,
                stage=self.stage,
                project=self.project,
            )
            return tool.run()
        if target == "local_docs":
            tool = LocalDocsScraper(
                path=self.url,
                output_path=self.output_path,
                stage=self.stage,
                project=self.project,
            )
            return tool.run()
        return "❌ Unsupported scraper. Choose from: firecrawl | github_repo | docs_site | local_docs."
