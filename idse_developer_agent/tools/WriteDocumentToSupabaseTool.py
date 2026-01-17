from typing import Optional, Dict, Any

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class WriteDocumentToSupabaseTool(BaseTool):
    """Write a document directly to Supabase (projects/sessions/documents)."""

    name: str = "WriteDocumentToSupabaseTool"
    description: str = (
        "Write markdown content to Supabase documents via the API. "
        "Use this instead of file-based tools when working in the Agency (database-first) model."
    )

    project: str = Field(..., description="Project name (as stored in Supabase, e.g., 'studiompd').")
    session: str = Field(..., description="Session slug (e.g., '__blueprint__', 'feature-x').")
    path: str = Field(..., description="Document path, e.g., 'feedback/feedback.md' or 'plans/plan.md'.")
    content: str = Field(..., description="Full markdown content to write.")
    stage: Optional[str] = Field(default=None, description="Optional stage label to store with the document.")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata dict to persist.")

    def run(self):
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."

            url = f"{backend_url}/api/sessions/{self.project}/{self.session}/documents"
            headers = {"Content-Type": "application/json"}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            payload = {
                "path": self.path,
                "content": self.content,
                "metadata": self.metadata or {},
                "stage": self.stage,
            }

            resp = requests.put(url, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                return (
                    "✅ Document written to Supabase\n"
                    f"📋 Project: {data.get('project', self.project)}\n"
                    f"📄 Session: {data.get('session', self.session)}\n"
                    f"🗂 Path: {data.get('path', self.path)}"
                )
            elif resp.status_code == 404:
                detail = resp.json().get("detail", "Not found")
                return f"❌ Not found: {detail}"
            else:
                detail = resp.json().get("detail", "Unknown error") if resp.content else "No response content"
                return f"❌ Failed to write document: {resp.status_code} - {detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check BACKEND_URL (default http://localhost:8000)."
        except Exception as exc:
            logger.error("Error writing document to Supabase: %s", exc)
            return f"❌ Error writing document: {exc}"
