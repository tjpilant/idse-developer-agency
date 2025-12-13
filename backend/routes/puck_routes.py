"""
Puck Page Builder Routes

Simple file-based storage for Puck page JSON payloads.

This is intended as a lightweight starter implementation; swap `PAGES_DIR`
for a persistent store (DB/object storage) in production.
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Any, Dict, List
import json
import uuid

router = APIRouter()

# File-based storage directory (created on import)
PAGES_DIR = Path("data/puck_pages")
PAGES_DIR.mkdir(parents=True, exist_ok=True)


def _page_path(page_id: str) -> Path:
    """Resolve the path for a given page id."""
    return PAGES_DIR / f"{page_id}.json"


@router.post("/", summary="Create a Puck page")
async def create_page(page_data: Dict[str, Any]):
    """Save a new Puck page configuration."""
    page_id = str(uuid.uuid4())
    page_data["id"] = page_id

    with _page_path(page_id).open("w", encoding="utf-8") as f:
        json.dump(page_data, f, indent=2)

    return {"id": page_id, "status": "created"}


@router.get("/{page_id}", summary="Get a Puck page by id")
async def get_page(page_id: str):
    """Return a stored Puck page configuration."""
    page_file = _page_path(page_id)
    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    with page_file.open("r", encoding="utf-8") as f:
        return json.load(f)


@router.put("/{page_id}", summary="Update a Puck page")
async def update_page(page_id: str, page_data: Dict[str, Any]):
    """Update an existing Puck page configuration."""
    page_file = _page_path(page_id)
    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    page_data["id"] = page_id
    with page_file.open("w", encoding="utf-8") as f:
        json.dump(page_data, f, indent=2)

    return {"id": page_id, "status": "updated"}


@router.delete("/{page_id}", summary="Delete a Puck page")
async def delete_page(page_id: str):
    """Delete a stored Puck page configuration."""
    page_file = _page_path(page_id)
    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    page_file.unlink()
    return {"id": page_id, "status": "deleted"}


@router.get("/", summary="List Puck pages")
async def list_pages():
    """List stored Puck pages with lightweight metadata."""
    pages: List[Dict[str, Any]] = []
    for page_file in PAGES_DIR.glob("*.json"):
        with page_file.open("r", encoding="utf-8") as f:
            page_data = json.load(f)
            pages.append(
                {
                    "id": page_data.get("id"),
                    "title": page_data.get("root", {}).get("title", "Untitled"),
                }
            )

    return {"pages": pages}
