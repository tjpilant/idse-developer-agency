from typing import Optional

from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os
import logging

logger = logging.getLogger(__name__)


class ReadDocumentFromSupabaseTool(BaseTool):
    """Read a document from Supabase (projects/sessions/documents)."""

    name: str = "ReadDocumentFromSupabaseTool"
    description: str = (
        "Read markdown content from Supabase documents via the API. "
        "Use this instead of file-based tools when working in the Agency (database-first) model."
    )

    project: str = Field(..., description="Project name (as stored in Supabase, e.g., 'figureme', 'studiompd').")
    session: str = Field(..., description="Session slug (e.g., '__blueprint__', 'feature-x').")
    path: str = Field(..., description="Document path, e.g., 'intents/intent.md' or 'feedback/feedback.md'.")

    def run(self):
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            if not backend_url:
                return "❌ BACKEND_URL is not set. Please configure the API base (e.g., http://localhost:8000)."

            # Use the documents_routes.py endpoint: GET /api/documents/{project}/{session}/{doc_path}
            url = f"{backend_url}/api/documents/{self.project}/{self.session}/{self.path}"
            headers = {}
            token = os.getenv("SYNC_AUTH_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"

            resp = requests.get(url, headers=headers, timeout=30)

            if resp.status_code == 200:
                data = resp.json()
                content = data.get("content", "")

                if not content:
                    return (
                        f"⚠️ Document exists but is empty:\n"
                        f"📋 Project: {self.project}\n"
                        f"📄 Session: {self.session}\n"
                        f"🗂 Path: {self.path}\n"
                        f"📝 Stage: {data.get('stage', 'N/A')}\n\n"
                        f"(This may be a newly created document that hasn't been populated yet)"
                    )

                return content

            elif resp.status_code == 404:
                detail = resp.json().get("detail", "Not found") if resp.content else "Document not found"
                return (
                    f"❌ Document not found in Supabase:\n"
                    f"📋 Project: {self.project}\n"
                    f"📄 Session: {self.session}\n"
                    f"🗂 Path: {self.path}\n"
                    f"Details: {detail}"
                )
            else:
                detail = resp.json().get("detail", "Unknown error") if resp.content else "No response content"
                return f"❌ Failed to read document: {resp.status_code} - {detail}"

        except requests.exceptions.Timeout:
            return "❌ Request timed out. Check if backend is running."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend. Check BACKEND_URL (default http://localhost:8000)."
        except Exception as exc:
            logger.error("Error reading document from Supabase: %s", exc)
            return f"❌ Error reading document: {exc}"
