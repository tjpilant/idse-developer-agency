from __future__ import annotations

import json
from pathlib import Path

from agency_swarm.tools import BaseTool
from pydantic import Field

from implementation.code.spec import spec_agent
from SessionManager import SessionManager


class CreateSpecTool(BaseTool):
    """Generate spec.md from context; prefers structured scrape output, falls back to spec_agent."""

    name: str = "CreateSpecTool"
    summarize: bool = Field(
        default=True,
        description="Summarize paragraphs into concise behaviors when using structured context.",
    )
    filter_code_blocks: bool = Field(
        default=True,
        description="Include code blocks from structured context.",
    )
    prefer_structured: bool = Field(
        default=True,
        description="Attempt to parse structured JSON context before falling back to spec_agent.",
    )
    intent_path: str = Field(
        default="intents/projects/<project>/sessions/<active>/intent.md",
        description="Path to intent.md (project/session scoped).",
    )
    context_path: str = Field(
        default="contexts/projects/<project>/sessions/<active>/context.md",
        description="Path to context.md (project/session scoped).",
    )
    output_path: str = Field(
        default="specs/projects/<project>/sessions/<active>/spec.md",
        description="Path where spec.md should be written (project/session scoped).",
    )
    project: str = Field(default="default", description="Project name for session-scoped paths.")

    def _resolve_path(self, stage: str, filename: str, candidate: str) -> Path:
        if "<active>" in candidate or "<project>" in candidate:
            return SessionManager.build_path(stage, filename)
        p = Path(candidate)
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    def _flatten_entries(self, data) -> list[dict]:
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            # Handle local docs shape: {"source": "...", "files": [...]}
            if "files" in data and isinstance(data["files"], list):
                return data["files"]
            return [data]
        return []

    def _build_spec_from_structured(self, data) -> str:
        spec_lines = ["# Specification"]
        entries = self._flatten_entries(data)
        if not entries:
            spec_lines.append("\n*No structured entries found; consider rerunning scraper.*")
            return "\n".join(spec_lines)

        for entry in entries:
            source = entry.get("file") or entry.get("url") or entry.get("source") or "[source]"
            spec_lines.append(f"\n## From: {source}\n")
            blocks = entry.get("content") or entry.get("pages") or []
            if not blocks and entry.get("files"):
                # In case nested structure in "files"
                nested = entry.get("files")
                for item in nested:
                    nested_source = item.get("file") or source
                    spec_lines.append(f"\n### File: {nested_source}")
                    blocks = item.get("content") or []
                    spec_lines.extend(self._render_blocks(blocks))
                continue
            spec_lines.extend(self._render_blocks(blocks))

        return "\n".join(spec_lines)

    def _render_blocks(self, blocks: list[dict]) -> list[str]:
        lines: list[str] = []
        for block in blocks or []:
            btype = block.get("type")
            if btype == "heading":
                lines.append(f"\n### Feature: {block.get('text', '').strip()}")
            elif btype == "paragraph" and self.summarize:
                text = block.get("text", "").strip()
                if len(text) > 10:
                    lines.append(f"- Behavior: {text}")
            elif btype == "code_block" and self.filter_code_blocks:
                lang = block.get("language", "text")
                code = block.get("code", "").strip()
                if code:
                    lines.append(f"\n```{lang}\n{code}\n```")
        return lines

    def run(self) -> str:
        meta = SessionManager.get_active_session()
        if meta.project != self.project:
            SessionManager.switch_project(self.project)

        intent_resolved = self._resolve_path("intents", "intent.md", self.intent_path)
        context_resolved = self._resolve_path("contexts", "context.md", self.context_path)
        output_resolved = self._resolve_path("specs", "spec.md", self.output_path)

        # Try structured path first
        if self.prefer_structured and context_resolved.exists():
            try:
                raw = context_resolved.read_text(encoding="utf-8")
                context_data = json.loads(raw)
                spec_text = self._build_spec_from_structured(context_data)
                output_resolved.write_text(spec_text, encoding="utf-8")
                return f"✅ spec.md written from structured context to: {output_resolved}"
            except json.JSONDecodeError:
                # Fallback to spec_agent if not structured
                pass
            except Exception as exc:
                return f"❌ Failed to build spec from structured context: {exc}"

        # Fallback to original spec agent
        return spec_agent.run(
            intent_path=str(intent_resolved),
            context_path=str(context_resolved),
            output_path=str(output_resolved),
        )
