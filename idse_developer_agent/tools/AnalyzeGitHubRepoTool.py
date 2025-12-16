from __future__ import annotations

import base64
from typing import List
from urllib.parse import urlparse

import requests
from agency_swarm.tools import BaseTool
from pydantic import Field


class AnalyzeGitHubRepoTool(BaseTool):
    """
    Fetch and summarize a GitHub repo by reading its README and a shallow file tree.
    Useful for getting a quick sense of a project before acting on it.
    """

    repo_url: str = Field(..., description="GitHub repo URL, e.g. https://github.com/user/repo")
    branch: str = Field(default="main", description="Branch to fetch from (default: main)")
    max_files: int = Field(default=20, description="Maximum number of file paths to include in the summary")

    def _parse_repo(self) -> tuple[str, str] | None:
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
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return "*No README.md found or access denied.*"
            data = resp.json()
            content = data.get("content", "")
            return base64.b64decode(content).decode("utf-8")
        except Exception as exc:  # Network or decode error
            return f"*Failed to fetch README: {exc}*"

    def _fetch_tree(self, owner: str, repo: str) -> List[str]:
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{self.branch}?recursive=1"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return []
            tree = resp.json()
            return [item["path"] for item in tree.get("tree", []) if item.get("type") == "blob"]
        except Exception:
            return []

    def run(self) -> str:
        parsed = self._parse_repo()
        if not parsed:
            return "❌ Invalid GitHub repo URL (expected https://github.com/<owner>/<repo>)."

        owner, repo = parsed

        readme = self._fetch_readme(owner, repo)
        files = self._fetch_tree(owner, repo)

        summary = [f"📘 **GitHub Repo Summary: {owner}/{repo}**", f"🔗 URL: {self.repo_url}", ""]
        if files:
            summary.append("📂 **Top Files:**")
            for path in files[: self.max_files]:
                summary.append(f"- {path}")
        else:
            summary.append("📂 **Top Files:** (none retrieved)")

        summary.append("")
        summary.append("📄 **README:**")
        summary.append(readme[:2000] if readme else "*No README content available.*")

        return "\n".join(summary)


if __name__ == "__main__":
    tool = AnalyzeGitHubRepoTool(repo_url="https://github.com/tjpilant/idse-developer-agent")
    print(tool.run())
