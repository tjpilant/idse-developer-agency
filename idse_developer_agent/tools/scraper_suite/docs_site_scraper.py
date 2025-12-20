from __future__ import annotations

from typing import List, Optional
from urllib.parse import urljoin

import requests
from agency_swarm.tools import BaseTool
from pydantic import Field

from idse_developer_agent.tools.scraper_suite.helpers import (
    ensure_project,
    render_header,
    resolve_output_path,
)


class DocsSiteScraper(BaseTool):
    """
    Fetch one or more documentation pages (e.g., ReadTheDocs) and persist the content.
    """

    base_url: str = Field(..., description="Base docs URL, e.g. https://example.readthedocs.io/en/latest/")
    paths: List[str] = Field(
        default_factory=list,
        description="Optional relative paths (e.g., ['getting-started.html']). If empty, fetches base_url only.",
    )
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

    def _fetch(self, url: str) -> str:
        try:
            resp = requests.get(url, timeout=20)
            if resp.status_code >= 300:
                return f"*Request failed ({resp.status_code}) for {url}*"
            return resp.text
        except Exception as exc:
            return f"*Request failed for {url}: {exc}*"

    def run(self) -> str:
        ensure_project(self.project)
        targets = [self.base_url]
        if self.paths:
            targets = [urljoin(self.base_url, p) for p in self.paths]

        sections = [render_header("Docs site", self.base_url)]
        for target in targets:
            sections.append(f"## Source: {target}")
            sections.append(self._fetch(target))
            sections.append("")  # spacer

        output_path = resolve_output_path(
            stage=self.stage,
            filename="docs_site.md",
            output_path=self.output_path,
        )
        output_path.write_text("\n".join(sections), encoding="utf-8")

        return f"✅ Docs pages fetched ({len(targets)} page(s)) and saved to {output_path}."
