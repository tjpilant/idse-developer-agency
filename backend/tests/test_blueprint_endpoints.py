import types
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routes import mcp_routes


class FakeTable:
    def __init__(self, name, rows):
        self.name = name
        self.rows = rows
        self.filters = []

    def select(self, _fields):
        self.filters = []
        return self

    def eq(self, key, value):
        self.filters.append((key, value))
        return self

    def _matches(self, row):
        return all(row.get(key) == value for key, value in self.filters)

    def execute(self):
        data = [row.copy() for row in self.rows if self._matches(row)]
        return types.SimpleNamespace(data=data)

    def update(self, payload):
        updated = []
        for row in self.rows:
            if self._matches(row):
                row.update(payload)
                updated.append(row.copy())
        return types.SimpleNamespace(data=updated)


class FakeSupabase:
    def __init__(self, projects, sessions):
        self.tables = {
            "projects": projects,
            "sessions": sessions,
        }

    def table(self, name):
        return FakeTable(name, self.tables[name])


@pytest.fixture(autouse=True)
def patched_supabase(monkeypatch):
    projects = [
        {"id": "proj-1", "name": "Test Project"},
    ]
    sessions = [
        {
            "project_id": "proj-1",
            "session_id": "__blueprint__",
            "name": "Project Blueprint (IDD)",
            "state_json": {"stages": {"intent": "pending"}, "progress_percent": 0},
            "is_blueprint": True,
            "updated_at": "2026-01-12T00:00:00Z",
            "created_at": "2026-01-12T00:00:00Z",
        },
        {
            "project_id": "proj-1",
            "session_id": "feature-1",
            "name": "Feature 1",
            "state_json": {
                "stages": {"intent": "pending", "context": "pending"},
                "progress_percent": 0,
            },
            "is_blueprint": False,
            "updated_at": "2026-01-12T00:00:00Z",
            "created_at": "2026-01-12T00:00:00Z",
        },
    ]

    fake = FakeSupabase(projects=projects, sessions=sessions)
    monkeypatch.setattr(mcp_routes, "supabase", fake)
    yield


@pytest.fixture()
def client():
    app = FastAPI()
    app.include_router(mcp_routes.router)
    return TestClient(app)


def test_get_session_status_blueprint(client):
    response = client.get("/sync/status/proj-1/__blueprint__")
    assert response.status_code == 200
    body = response.json()
    assert body["session_id"] == "__blueprint__"
    assert body["is_blueprint"] is True
    assert body["project_id"] == "proj-1"


def test_get_session_status_regular(client):
    response = client.get("/sync/status/proj-1/feature-1")
    assert response.status_code == 200
    body = response.json()
    assert body["is_blueprint"] is False
    assert body["session_name"] == "Feature 1"


def test_update_session_status(client):
    payload = {
        "stages": {"intent": "complete", "context": "in_progress"},
        "last_agent": "claude",
    }
    response = client.put("/sync/status/proj-1/feature-1", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "stages" in body["updated_fields"]


def test_update_invalid_stage(client):
    payload = {"stages": {"invalid": "complete"}}
    response = client.put("/sync/status/proj-1/feature-1", json=payload)
    assert response.status_code == 400
    assert "Invalid stage name" in response.json()["detail"]


def test_session_not_found(client):
    response = client.get("/sync/status/proj-1/missing-session")
    assert response.status_code == 404
