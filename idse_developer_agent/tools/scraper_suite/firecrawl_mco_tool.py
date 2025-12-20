from __future__ import annotations

import json
import os
from typing import Optional

import requests
from agency_swarm.tools import BaseTool
from pydantic import Field

from idse_developer_agent.tools.scraper_suite.helpers import (
    ensure_project,
    render_header,
    resolve_output_path,
)


class FirecrawlMcoTool(BaseTool):
    """
    Call Firecrawl (MCO) to scrape or crawl a URL and persist the result to a session-scoped file.
    """

    url: str = Field(..., description="Target URL to scrape or crawl.")
    mode: str = Field(
        default="scrape",
        description="Mode to use: 'scrape' (single page) or 'crawl' (multi-page).",
    )
    depth: int = Field(
        default=1,
        description="Max crawl depth (only used when mode='crawl').",
        ge=1,
        le=5,
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
    api_key: Optional[str] = Field(
        default=None,
        description="Firecrawl API key. Falls back to FIRECRAWL_API_KEY env var.",
    )

    def _call_firecrawl(self, api_key: str) -> tuple[bool, str]:
        base_url = os.getenv("FIRECRAWL_BASE_URL", "https://api.firecrawl.dev")
        use_crawl = self.mode.lower() == "crawl"
        endpoint = "/v1/crawl" if use_crawl else "/v1/scrape"
        payload = {"url": self.url}
        if use_crawl:
            payload["maxDepth"] = self.depth
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        try:
            resp = requests.post(
                base_url.rstrip("/") + endpoint,
                headers=headers,
                json=payload,
                timeout=45,
            )
            if resp.status_code >= 300:
                return False, f"Firecrawl returned {resp.status_code}: {resp.text[:400]}"
            data = resp.json()
            content = (
                data.get("content")
                or data.get("markdown")
                or data.get("data")
                or data.get("results")
                or data
            )
            if isinstance(content, (dict, list)):
                body = json.dumps(content, indent=2)
            else:
                body = str(content)
            return True, body
        except Exception as exc:
            return False, f"Firecrawl call failed: {exc}"

    def run(self) -> str:
        ensure_project(self.project)
        api_key = self.api_key or os.getenv("FIRECRAWL_API_KEY")
        if not api_key:
            return "❌ FIRECRAWL_API_KEY not set; cannot call Firecrawl."

        ok, body = self._call_firecrawl(api_key=api_key)
        output_path = resolve_output_path(
            stage=self.stage,
            filename="firecrawl.md",
            output_path=self.output_path,
        )
        if ok:
            output = render_header("Firecrawl", self.url) + body
            output_path.write_text(output, encoding="utf-8")
            preview = body[:400]
            return f"✅ Firecrawl {self.mode} complete. Saved to {output_path}.\nPreview:\n{preview}"
        else:
            # Persist failure for traceability
            error_output = render_header("Firecrawl (error)", self.url) + body
            output_path.write_text(error_output, encoding="utf-8")
            return f"⚠️ Firecrawl {self.mode} failed. Error saved to {output_path}.\nDetails: {body}"
