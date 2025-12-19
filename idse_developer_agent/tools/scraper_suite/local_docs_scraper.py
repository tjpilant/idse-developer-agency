from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import List, Optional

from agency_swarm.tools import BaseTool
from pydantic import Field

from idse_developer_agent.tools.scraper_suite.helpers import (
    ensure_project,
    resolve_output_path,
    render_header,
)


class LocalDocsScraper(BaseTool):
    """
    Scrape structured content from local Markdown/text/reStructuredText files.
    Extracts headings, paragraphs, and code blocks, and writes JSON output to a session-scoped file.
    """

    name: str = "LocalDocsScraper"
    path: str = Field(default="", description="Local file or directory path (e.g., ./docs/ or ./README.md)")
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

    def _gather_files(self, base: Path) -> List[Path]:
        if base.is_file():
            return [base]
        if base.is_dir():
            return sorted(
                p for p in base.rglob("*") if p.is_file() and p.suffix.lower() in {".md", ".txt", ".rst"}
            )
        return []

    def _extract_structured_content(self, content: str) -> List[dict]:
        blocks: List[dict] = []
        lines = content.splitlines()
        current_block = {"type": "paragraph", "text": ""}

        in_code = False
        code_lang = ""
        code_lines: List[str] = []

        for line in lines:
            if line.strip().startswith("```"):
                if not in_code:
                    in_code = True
                    code_lang = line.strip()[3:].strip()
                    code_lines = []
                else:
                    in_code = False
                    blocks.append(
                        {
                            "type": "code_block",
                            "language": code_lang or "text",
                            "code": "\n".join(code_lines),
                        }
                    )
                continue

            if in_code:
                code_lines.append(line)
                continue

            heading_match = re.match(r"^(#{1,6})\s+(.*)", line)
            if heading_match:
                if current_block["text"]:
                    blocks.append(current_block)
                    current_block = {"type": "paragraph", "text": ""}
                blocks.append(
                    {
                        "type": "heading",
                        "level": len(heading_match.group(1)),
                        "text": heading_match.group(2).strip(),
                    }
                )
                continue

            if line.strip():
                current_block["text"] += line.strip() + " "
            else:
                if current_block["text"]:
                    blocks.append(current_block)
                    current_block = {"type": "paragraph", "text": ""}

        if current_block["text"]:
            blocks.append(current_block)

        return blocks

    def run(self) -> str:
        ensure_project(self.project)
        base = Path(self.path).resolve()
        files = self._gather_files(base)
        output_path = resolve_output_path(
            stage=self.stage,
            filename="local_docs.json",
            output_path=self.output_path,
        )

        if not files:
            output = render_header("Local docs (error)", str(base)) + "*No supported files found.*"
            output_path.write_text(output, encoding="utf-8")
            return f"⚠️ No supported files found at {base}. Logged to {output_path}."

        content_chunks = []
        for file_path in files:
            try:
                text = file_path.read_text(encoding="utf-8")
                structured = self._extract_structured_content(text)
                content_chunks.append({"file": str(file_path), "content": structured})
            except Exception as exc:
                content_chunks.append({"file": str(file_path), "error": str(exc)})

        output_data = {
            "source": str(base),
            "files": content_chunks,
        }
        output_path.write_text(json.dumps(output_data, indent=2), encoding="utf-8")
        return f"✅ Local docs scraped ({len(files)} file(s)) and saved to {output_path}."


__all__ = ["LocalDocsScraper"]
