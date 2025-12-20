from __future__ import annotations

import base64
from typing import List, Optional, Tuple
from urllib.parse import urlparse

import requests
from agency_swarm.tools import BaseTool
from pydantic import Field

from idse_developer_agent.tools.scraper_suite.helpers import (
    ensure_project,
    render_header,
    resolve_output_path,
)


class GitHubRepoScraper(BaseTool):
    """
    Scrape a GitHub repository (README + file listing) and persist to a session-scoped file.
    """

    name: str = "GitHubRepoScraper"
    repo_url: str = Field(default="", description="GitHub repo URL, e.g. https://github.com/user/repo")
    branch: str = Field(default="main", description="Branch to fetch from (default: main)")
    max_files: int = Field(default=50, description="Maximum number of file paths to include in the output")
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

    def _parse_repo(self) -> Tuple[str, str] | None:
        try:
            parts = urlparse(self.repo_url)
            owner, repo = parts.path.strip("/").split("/")[:2]
            if not owner or not repo:
                return None
            return owner, repo
        except Exception:
            return None

    def _fetch_readme(self, owner: str, repo: str) -> str:
        url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code != 200:
                return f"*No README found or access denied (status {resp.status_code}).*"
            data = resp.json()
            content = data.get("content", "")
            return base64.b64decode(content).decode("utf-8")
        except Exception as exc:
            return f"*Failed to fetch README: {exc}*"

    def _fetch_tree(self, owner: str, repo: str) -> List[str]:
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{self.branch}?recursive=1"
        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code != 200:
                return []
            tree = resp.json()
            return [item["path"] for item in tree.get("tree", []) if item.get("type") == "blob"]
        except Exception:
            return []

    def run(self) -> str:
        ensure_project(self.project)
        parsed = self._parse_repo()
        if not parsed:
            return "❌ Invalid GitHub repo URL (expected https://github.com/<owner>/<repo>)."

        owner, repo = parsed
        readme = self._fetch_readme(owner, repo)
        files = self._fetch_tree(owner, repo)

        lines = [
            render_header("GitHub repo", self.repo_url),
            f"## Repo\n- owner: {owner}\n- repo: {repo}\n- branch: {self.branch}\n",
        ]
        lines.append("## File listing")
        if files:
            for path in files[: self.max_files]:
                lines.append(f"- {path}")
        else:
            lines.append("- (no files retrieved)")
        lines.append("\n## README (truncated)")
        lines.append(readme[:5000] if readme else "*No README content available.*")

        output_path = resolve_output_path(
            stage=self.stage,
            filename="github_repo.md",
            output_path=self.output_path,
        )
        output_path.write_text("\n".join(lines), encoding="utf-8")

        preview = readme[:400] if readme else "(no README)"
        return (
            f"✅ GitHub repo scraped and saved to {output_path}.\n"
            f"Files captured: {min(len(files), self.max_files)} (of {len(files) if files else 0}).\n"
            f"README preview:\n{preview}"
        )
