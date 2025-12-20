import json
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_ROOT = BASE_DIR / "data" / "puck_pages"


@dataclass
class PageData:
    slug: str
    title: str
    schemaVersion: int
    root: Dict
    content: List[Dict] = field(default_factory=list)
    id: Optional[str] = None
    extras: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict) -> "PageData":
        extras = {k: v for k, v in data.items() if k not in {"id", "slug", "title", "schemaVersion", "root", "content"}}
        return cls(
            id=data.get("id"),
            slug=data["slug"],
            title=data.get("title", data["slug"]),
            schemaVersion=data.get("schemaVersion", 1),
            root=data["root"],
            content=data.get("content", []) or [],
            extras=extras,
        )

    def to_dict(self) -> Dict:
        base = {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "schemaVersion": self.schemaVersion,
            "root": self.root,
            "content": self.content,
        }
        return {**base, **self.extras}


def _ensure_dir() -> None:
    DATA_ROOT.mkdir(parents=True, exist_ok=True)


def _file_path(slug: str) -> Path:
    return DATA_ROOT / f"{slug}.json"


def list_pages() -> List[Dict]:
    """Return a lightweight listing of stored pages."""
    _ensure_dir()
    pages: List[Dict] = []
    for file in DATA_ROOT.glob("*.json"):
        try:
            data = json.loads(file.read_text(encoding="utf-8"))
            pages.append(
                {
                    "slug": data.get("slug") or file.stem,
                    "title": data.get("title") or file.stem,
                    "id": data.get("id"),
                }
            )
        except Exception:
            # Skip unreadable entries but continue scanning
            continue
    return pages


def find_by_slug(slug: str) -> Optional[PageData]:
    _ensure_dir()
    path = _file_path(slug)
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    return PageData.from_dict(data)


def create(page: PageData) -> PageData:
    """Create a page with a fixed slug. Overwrites if file already exists."""
    _ensure_dir()
    page.id = page.id or str(uuid.uuid4())
    path = _file_path(page.slug)
    path.write_text(json.dumps(page.to_dict(), indent=2), encoding="utf-8")
    return page


def update_by_slug(slug: str, page: PageData) -> PageData:
    """Update an existing page, preserving slug and id."""
    existing = find_by_slug(slug)
    if not existing:
        raise FileNotFoundError(slug)

    page.slug = existing.slug
    page.id = existing.id or page.id or str(uuid.uuid4())

    path = _file_path(existing.slug)
    path.write_text(json.dumps(page.to_dict(), indent=2), encoding="utf-8")
    return page
