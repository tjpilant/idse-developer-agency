from __future__ import annotations

import json
import os

import requests

from idse_developer_agent.tools.scraper_suite.helpers import (
    ensure_project,
    render_header,
    resolve_output_path,
)


def call_firecrawl_scrape(
    url: str,
    include_mco: bool = True,
    stage: str = "context",
    output_path: str | None = None,
    project: str | None = None,
) -> str:
    """
    Call Firecrawl MCP scrape endpoint directly and persist output to a session-scoped file.
    """
    ensure_project(project)
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        return "Missing FIRECRAWL_API_KEY in environment."

    target = url
    payload = {
        "url": target,
        "crawl": False,
        "mco": include_mco,
        "includeHtml": False,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    output_path_resolved = resolve_output_path(
        stage=stage,
        filename="firecrawl.md",
        output_path=output_path,
    )
    try:
        resp = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers=headers,
            json=payload,
            timeout=45,
        )
        if resp.status_code >= 300:
            body = f"Firecrawl returned {resp.status_code}: {resp.text[:400]}"
            error_output = render_header("Firecrawl (error)", target) + body
            output_path_resolved.write_text(error_output, encoding="utf-8")
            return f"⚠️ Firecrawl scrape failed; error saved to {output_path_resolved}."
        data = resp.json()
        output = render_header("Firecrawl", target) + json.dumps(data, indent=2)
        output_path_resolved.write_text(output, encoding="utf-8")
        preview = json.dumps(data, indent=2)[:400]
        return f"✅ Firecrawl scrape complete. Saved to {output_path_resolved}.\nPreview:\n{preview}"
    except Exception as exc:
        body = f"Firecrawl call failed: {exc}"
        error_output = render_header("Firecrawl (error)", target) + body
        output_path_resolved.write_text(error_output, encoding="utf-8")
        return f"⚠️ Firecrawl scrape failed; error saved to {output_path_resolved}. Details: {exc}"


__all__ = ["call_firecrawl_scrape"]
