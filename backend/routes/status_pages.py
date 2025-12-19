from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from backend.services import status_page_store


class PageDataModel(BaseModel):
    slug: str
    title: str
    schemaVersion: int
    root: dict
    content: List[dict] = []
    id: Optional[str] = None

    class Config:
        extra = "allow"


class PageListResponse(BaseModel):
    pages: List[dict]


class PageResponse(BaseModel):
    page: PageDataModel


router = APIRouter(prefix="/api/status-pages", tags=["Status Pages"])


@router.get("/", response_model=PageListResponse)
async def list_pages():
    """List all stored pages (slug/title/id)."""
    return {"pages": status_page_store.list_pages()}


@router.get("/{slug}", response_model=PageResponse)
async def get_page(slug: str):
    page = status_page_store.find_by_slug(slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"page": page.to_dict()}


@router.post("/", response_model=PageResponse, status_code=201)
async def create_page(page: PageDataModel):
    if not page.slug:
        raise HTTPException(status_code=400, detail="Slug is required")
    created = status_page_store.create(status_page_store.PageData.from_dict(page.model_dump()))
    return {"page": created.to_dict()}


@router.put("/{slug}", response_model=PageResponse)
async def update_page(slug: str, page: PageDataModel):
    try:
        updated = status_page_store.update_by_slug(
            slug, status_page_store.PageData.from_dict(page.model_dump())
        )
        return {"page": updated.to_dict()}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Page not found")
