from .idse_developer_agent import idse_developer_agent
from idse_developer_agent.tools.scraper_suite import (
    DocsSiteScraper,
    FirecrawlMcoTool,
    GitHubRepoScraper,
    ScraperDispatcherTool,
)

# Optional tool registry placeholder (avoid instantiating required-field tools here)
TOOLS = []

__all__ = ["idse_developer_agent", "TOOLS"]
