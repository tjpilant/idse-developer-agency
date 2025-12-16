"""
Puck Page Builder Routes

Simple file-based storage for Puck page JSON payloads.

This is intended as a lightweight starter implementation; swap `PAGES_DIR`
for a persistent store (DB/object storage) in production.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import uuid
import re

router = APIRouter()

# File-based storage directory (created on import)
PAGES_DIR = Path("data/puck_pages")
PAGES_DIR.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    """Create a URL-safe slug from a title."""
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or f"page-{uuid.uuid4().hex[:8]}"


def _page_path(page_id: str) -> Path:
    """Resolve the path for a given page id."""
    return PAGES_DIR / f"{page_id}.json"


def _load_page_by_id(page_id: str) -> Optional[Dict[str, Any]]:
    """Load a page by id if it exists."""
    page_file = _page_path(page_id)
    if not page_file.exists():
        return None
    with page_file.open("r", encoding="utf-8") as f:
        return json.load(f)


def _load_page_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """Linear scan for a page with the given slug."""
    for page_file in PAGES_DIR.glob("*.json"):
        with page_file.open("r", encoding="utf-8") as f:
            data = json.load(f)
            if data.get("slug") == slug:
                return data
    return None


def _ensure_unique_slug(base_slug: str, exclude_id: Optional[str] = None) -> str:
    """Ensure slug uniqueness across stored pages."""
    existing_slugs = set()
    for page_file in PAGES_DIR.glob("*.json"):
        with page_file.open("r", encoding="utf-8") as f:
            data = json.load(f)
            if exclude_id and data.get("id") == exclude_id:
                continue
            if data_slug := data.get("slug"):
                existing_slugs.add(data_slug)

    slug = base_slug
    counter = 1
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def _normalize_page_payload(
    raw: Dict[str, Any],
    page_id: Optional[str] = None,
    current_slug: Optional[str] = None,
) -> Dict[str, Any]:
    """Apply defaults and metadata to a page payload."""
    page_id = page_id or str(uuid.uuid4())
    title = raw.get("title") or raw.get("root", {}).get("title") or "Untitled"
    desired_slug = raw.get("slug") or slugify(title)
    # If we are updating and the slug hasn't changed, keep it as-is to avoid
    # unnecessary slug mutations (e.g., "-1" suffixes).
    if current_slug and desired_slug == current_slug:
        slug = current_slug
    else:
        # When updating, always exclude the current page id from collision checks
        slug = _ensure_unique_slug(desired_slug, exclude_id=page_id or raw.get("id"))

    # Keep root.title in sync for Puck preview defaults
    root = raw.get("root", {}) if isinstance(raw.get("root"), dict) else {}
    if "title" not in root:
        root["title"] = title

    normalized = {
        **raw,
        "id": page_id,
        "title": title,
        "slug": slug,
        "updated_at": datetime.utcnow().isoformat(),
        "root": root,
    }
    return normalized


@router.post("/", summary="Create a Puck page")
async def create_page(page_data: Dict[str, Any]):
    """Save a new Puck page configuration with title/slug metadata."""
    normalized = _normalize_page_payload(page_data)
    with _page_path(normalized["id"]).open("w", encoding="utf-8") as f:
        json.dump(normalized, f, indent=2)

    return {"id": normalized["id"], "slug": normalized["slug"], "status": "created"}


@router.get("/{page_id_or_slug}", summary="Get a Puck page by id or slug")
async def get_page(page_id_or_slug: str):
    """Return a stored Puck page configuration."""
    page = _load_page_by_id(page_id_or_slug) or _load_page_by_slug(page_id_or_slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.put("/{page_id_or_slug}", summary="Update a Puck page")
async def update_page(page_id_or_slug: str, page_data: Dict[str, Any]):
    """Update an existing Puck page configuration."""
    existing = _load_page_by_id(page_id_or_slug) or _load_page_by_slug(page_id_or_slug)
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")

    page_id = existing["id"]
    overwrite = bool(page_data.get("overwrite"))

    merged = {**existing, **page_data}

    if overwrite:
        # Force-keep the current slug unless caller explicitly changes it
        desired_slug = page_data.get("slug") or existing.get("slug")
        normalized = _normalize_page_payload(
            merged,
            page_id=page_id,
            current_slug=desired_slug,
        )
    else:
        normalized = _normalize_page_payload(merged, page_id=page_id, current_slug=existing.get("slug"))
    with _page_path(page_id).open("w", encoding="utf-8") as f:
        json.dump(normalized, f, indent=2)

    return {"id": normalized["id"], "slug": normalized["slug"], "status": "updated"}


@router.delete("/{page_id_or_slug}", summary="Delete a Puck page")
async def delete_page(page_id_or_slug: str):
    """Delete a stored Puck page configuration."""
    existing = _load_page_by_id(page_id_or_slug) or _load_page_by_slug(page_id_or_slug)
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")

    _page_path(existing["id"]).unlink()
    return {"id": existing["id"], "slug": existing.get("slug"), "status": "deleted"}


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
                    "title": page_data.get("title") or page_data.get("root", {}).get("title", "Untitled"),
                    "slug": page_data.get("slug"),
                    "updated_at": page_data.get("updated_at"),
                }
            )

    return {"pages": pages}
