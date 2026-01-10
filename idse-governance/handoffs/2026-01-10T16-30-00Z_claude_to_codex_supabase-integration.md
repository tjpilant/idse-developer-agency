# Handoff: Claude Code → GPT Codex
**Date**: 2026-01-10T16:30:00Z
**Session**: IDSE_Core/objective
**Stage**: Implementation → CLI Integration + Dashboard

---

## 🎯 What I Accomplished

### 1. Governance Separation Architecture ✅
**Created layered governance with smart pointers:**

- **Universal Layer**: [.idse/governance/IDSE_CONSTITUTION.md](.idse/governance/IDSE_CONSTITUTION.md)
  - Articles I-X for all IDSE projects
  - Pipeline stages, session management, validation

- **Framework Layer**: [.idse/governance/AGENCY_SWARM_CONSTITUTION.md](.idse/governance/AGENCY_SWARM_CONSTITUTION.md)
  - Articles AS-I through AS-XII for Agency Swarm projects
  - Agent structure, tool requirements, testing standards

- **Pointer Files**: [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md)
  - Exist where agents expect them
  - Point to actual governance in `.idse/governance/`

### 2. IDSE Orchestrator Package ✅
**Location**: `idse-orchestrator/`

**What's Complete**:
- ✅ CLI structure with Click framework
- ✅ Commands: `idse init`, `idse validate`, `idse sync`, `idse status`
- ✅ Project manager (Article X compliant structure)
- ✅ Template loader (multi-path resolution)
- ✅ State tracker (`session_state.json`)
- ✅ Validator (constitutional compliance)
- ✅ MCP client (stub - **needs your work**)
- ✅ Agent router (stub)
- ✅ Pip packaging (setup.py, pyproject.toml)

**Testing**:
```bash
source .venv-orchestrator/bin/activate
pip install -e idse-orchestrator/
idse init test-project  # ✅ Works
idse validate           # ✅ Works
```

### 3. Supabase Backend ✅
**Connection**: `https://spxovndsgpzvcztbkjel.supabase.co`

**Database Schema**:
- Table: `projects`
- Columns: `id`, `name`, `stack`, `framework`, `intent_md`, `context_md`, `spec_md`, `plan_md`, `tasks_md`, `implementation_md`, `feedback_md`, `state_json`
- Credentials in `.env`: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**SQL Script**: [backend/supabase/create_projects_table.sql](backend/supabase/create_projects_table.sql)
**Status**: ✅ Table created, 2 test projects exist

### 4. MCP Sync Service ✅
**File**: [backend/routes/mcp_routes.py](backend/routes/mcp_routes.py)

**Endpoints** (all tested and working):
```
GET  /sync/health              ✅ Supabase connection check
GET  /sync/projects            ✅ List all projects
POST /sync/push                ✅ Push artifacts to Supabase
POST /sync/pull                ✅ Pull artifacts from Supabase
GET  /sync/status/{project_id} ✅ Get sync status
```

**Backend Integration**: ✅ Registered in [backend/main.py](backend/main.py:103-105)

**Testing Results**:
```bash
# All endpoints confirmed working
curl http://localhost:8000/sync/health
# {"status":"healthy","supabase_connected":true}

curl http://localhost:8000/sync/projects
# Returns 2 projects: customer-portal, test-project
```

---

## 🔨 What Needs Your Implementation

### Task A: CLI Integration (Priority 1)

**Goal**: Wire up `idse sync push` and `idse sync pull` commands to actually use the MCP backend.

**Current State**:
- File: `idse-orchestrator/src/idse_orchestrator/mcp_client.py`
- Status: Has structure but uses dummy authentication
- Methods exist: `push_project()`, `pull_project()`, `apply_pull()`

**What You Need to Do**:

#### A.1: Update MCP Client Authentication
**File**: `idse-orchestrator/src/idse_orchestrator/mcp_client.py:162-171`

**Current code** (dummy):
```python
def _authenticate(self) -> str:
    """Authenticate with Agency Core and get JWT token."""
    # TODO: Implement actual authentication
    return "dummy-jwt-token-for-development"
```

**Your task**:
- For now, skip JWT authentication (backend doesn't require it yet)
- Just remove the Authorization header or pass empty string
- **OR** if you want proper auth: implement JWT token generation based on Supabase API key

#### A.2: Fix MCP Endpoint URLs
**File**: `idse-orchestrator/src/idse_orchestrator/mcp_client.py`

**Current code** uses wrong endpoints:
```python
# Line 75: Wrong endpoint
response = self.session.post(
    f"{self.agency_url}/mcp/sync/push",  # ❌ Wrong
    ...
)

# Line 114: Wrong endpoint
response = self.session.get(
    f"{self.agency_url}/mcp/sync/pull",  # ❌ Wrong
    ...
)
```

**Your fix**:
```python
# Correct endpoints (match backend routes)
f"{self.agency_url}/sync/push"  # ✅ Correct
f"{self.agency_url}/sync/pull"  # ✅ Correct
```

#### A.3: Update Request/Response Format
**File**: `idse-orchestrator/src/idse_orchestrator/mcp_client.py`

**Push method** (lines 64-87):
- Current payload format doesn't match backend expectations
- Backend expects: `{"project_name": "...", "artifacts": {...}, "state_json": {...}}`
- Current sends: `{"project_id": "...", "client_id": "...", "artifacts": {...}, "session_state": {...}}`

**Your fix**:
```python
def push_project(self, project_name: Optional[str] = None) -> Dict:
    # ... existing code to read artifacts ...

    # Get or create project_id
    config = self._load_config()
    project_id = config.get("project_id")  # May be None for new projects

    # Prepare payload matching backend schema
    payload = {
        "project_id": project_id,  # None = create new
        "project_name": project_name or project_path.name,
        "stack": "python",  # TODO: detect from project
        "framework": "agency-swarm",  # TODO: detect from project
        "artifacts": {
            f"{key.replace('.md', '_md')}": value
            for key, value in artifacts.items()
        },
        "state_json": state
    }

    # Send to backend (NO Authorization header for now)
    response = self.session.post(
        f"{self.agency_url}/sync/push",
        json=payload
    )

    response.raise_for_status()
    result = response.json()

    # Save project_id for future syncs
    if not project_id:
        self._save_project_id(result["project_id"])

    return result
```

**Pull method** (lines 89-122):
- Backend returns `{"artifacts": {"intent_md": "...", "context_md": "..."}, ...}`
- Current code expects `{"artifacts": {"intent.md": "...", "context.md": "..."}}`
- Need to convert `intent_md` → `intent.md` when applying

**Your fix**:
```python
def apply_pull(self, pull_response: Dict) -> None:
    # ... existing code ...

    artifacts = pull_response.get("artifacts", {})

    # Convert intent_md → intent.md format
    artifact_map = {
        "intent_md": session_path / "intents" / "intent.md",
        "context_md": session_path / "contexts" / "context.md",
        "spec_md": session_path / "specs" / "spec.md",
        "plan_md": session_path / "plans" / "plan.md",
        "tasks_md": session_path / "tasks" / "tasks.md",
        "implementation_md": session_path / "implementation" / "README.md",
        "feedback_md": session_path / "feedback" / "feedback.md",
    }

    for artifact_key, file_path in artifact_map.items():
        if artifact_key in artifacts:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(artifacts[artifact_key])
```

#### A.4: Add Config Management
**File**: `idse-orchestrator/src/idse_orchestrator/mcp_client.py`

**Add method to save project_id**:
```python
def _save_project_id(self, project_id: str) -> None:
    """Save project ID to config for future syncs."""
    from .project_manager import ProjectManager

    manager = ProjectManager()
    project_path = manager.get_current_project()
    config_file = project_path / ".idse" / "config.json"

    config = {}
    if config_file.exists():
        config = json.loads(config_file.read_text())

    config["project_id"] = project_id
    config["last_sync"] = datetime.now().isoformat()

    config_file.write_text(json.dumps(config, indent=2))
```

#### A.5: Test End-to-End
```bash
# Create new project
source .venv-orchestrator/bin/activate
idse init test-sync

# Edit intent.md
echo "# Test Intent\n\nThis is a test." > .idse/projects/test-sync/sessions/*/intents/intent.md

# Push to Supabase
idse sync push
# Should create new project in Supabase

# Verify in Supabase
curl http://localhost:8000/sync/projects
# Should show test-sync project

# Pull from Supabase
idse sync pull
# Should update local files
```

**Acceptance Criteria**:
- ✅ `idse sync push` creates/updates project in Supabase
- ✅ `idse sync pull` downloads artifacts to local `.idse/`
- ✅ No errors in terminal
- ✅ state_json properly synced

---

### Task B: Dashboard (Priority 2)

**Goal**: Build a Next.js dashboard to visualize all IDSE projects and their stage completion.

**Location**: Create new directory `frontend/dashboard/`

**What You Need to Build**:

#### B.1: Initialize Next.js Project
```bash
cd frontend
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
npm install axios recharts lucide-react
```

#### B.2: Create Dashboard Layout
**File**: `frontend/dashboard/app/page.tsx`

**Features**:
- Fetch projects from `http://localhost:8000/sync/projects`
- Display project cards with:
  - Project name
  - Stack and framework
  - Stage completion (7 stages as progress bar)
  - Last synced timestamp
  - Last agent
- Click project → navigate to detail view

**Mockup**:
```
┌─────────────────────────────────────────┐
│ IDSE Agency Core Dashboard              │
├─────────────────────────────────────────┤
│ 📊 2 Active Projects                    │
│                                         │
│ ┌─────────────────────────────┐        │
│ │ customer-portal             │        │
│ │ Python • Agency Swarm       │        │
│ │ ▓▓▓▓▓░░░░░░░░░ 35% Complete│        │
│ │ Intent ✅ Context ✅ Spec 🔄│        │
│ │ Last: Claude Code           │        │
│ │ Synced: 2 hours ago         │        │
│ └─────────────────────────────┘        │
│                                         │
│ ┌─────────────────────────────┐        │
│ │ test-project                │        │
│ │ Python • Agency Swarm       │        │
│ │ ░░░░░░░░░░░░░░ 0% Complete │        │
│ │ All stages: pending         │        │
│ │ Last: None                  │        │
│ │ Synced: 2 hours ago         │        │
│ └─────────────────────────────┘        │
└─────────────────────────────────────────┘
```

#### B.3: Create Project Detail View
**File**: `frontend/dashboard/app/project/[id]/page.tsx`

**Features**:
- Fetch single project: `GET /sync/status/{id}`
- Show all 7 stages with status (pending/in_progress/complete)
- Display artifacts (intent_md, context_md, etc.) in tabs
- Show state_json as JSON viewer
- Button to trigger sync

#### B.4: Add Real-time Updates (Optional)
- Poll `/sync/projects` every 10 seconds
- Show notification when projects update
- Use Supabase Realtime (if you want to go fancy)

#### B.5: Styling
- Use Tailwind CSS
- Match Agency Swarm design language
- Responsive (mobile-friendly)

**Example Component**:
```tsx
// frontend/dashboard/components/ProjectCard.tsx
import { Card } from '@/components/ui/card'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    stack: string
    framework: string
    state_json: {
      stages: Record<string, string>
      last_agent: string
    }
    updated_at: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const stages = Object.values(project.state_json.stages)
  const complete = stages.filter(s => s === 'complete').length
  const percentage = (complete / stages.length) * 100

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold">{project.name}</h3>
      <p className="text-sm text-gray-500">
        {project.stack} • {project.framework}
      </p>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm mt-1">{percentage.toFixed(0)}% Complete</p>
      </div>

      <div className="mt-4 flex gap-2">
        {Object.entries(project.state_json.stages).map(([stage, status]) => (
          <span key={stage} className={`text-xs px-2 py-1 rounded ${
            status === 'complete' ? 'bg-green-100' :
            status === 'in_progress' ? 'bg-yellow-100' :
            'bg-gray-100'
          }`}>
            {stage}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Last: {project.state_json.last_agent || 'None'}
        <br />
        Synced: {new Date(project.updated_at).toLocaleString()}
      </p>
    </Card>
  )
}
```

**Acceptance Criteria**:
- ✅ Dashboard loads and displays all projects
- ✅ Stage completion shown accurately
- ✅ Click project → see detail view
- ✅ Refresh button works
- ✅ Responsive design
- ✅ No console errors

---

## 📦 Files You'll Modify/Create

### Task A: CLI Integration
**Modify**:
- `idse-orchestrator/src/idse_orchestrator/mcp_client.py` (lines 64-224)

**Test**:
- Create test project and run sync commands

### Task B: Dashboard
**Create**:
- `frontend/dashboard/` (entire directory)
- `frontend/dashboard/app/page.tsx`
- `frontend/dashboard/app/project/[id]/page.tsx`
- `frontend/dashboard/components/ProjectCard.tsx`
- `frontend/dashboard/lib/api.ts` (axios wrapper)

---

## 🔧 Environment Setup

### Backend (already running)
```bash
# Backend is running on http://localhost:8000
# MCP endpoints available at /sync/*
```

### Orchestrator
```bash
source .venv-orchestrator/bin/activate
cd idse-orchestrator
# Make your changes to mcp_client.py
# Test with: idse sync push / idse sync pull
```

### Dashboard
```bash
cd frontend
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
npm run dev
# Dashboard runs on http://localhost:3000
```

---

## 🧪 Testing Checklist

### Task A: CLI Integration
- [ ] `idse sync push` creates new project in Supabase
- [ ] `idse sync push` updates existing project
- [ ] `idse sync pull` downloads artifacts correctly
- [ ] `idse sync pull` creates proper directory structure
- [ ] state_json syncs both directions
- [ ] No errors in terminal output
- [ ] Verify in Supabase table editor

### Task B: Dashboard
- [ ] Dashboard loads without errors
- [ ] All projects display correctly
- [ ] Stage progress bars accurate
- [ ] Click project → detail view works
- [ ] Artifacts display in tabs
- [ ] Refresh button updates data
- [ ] Mobile responsive
- [ ] No console errors

---

## 📚 Reference Documentation

**Architecture**:
- [SUPABASE_MCP_COMPLETE.md](../projects/IDSE_Core/sessions/objective/implementation/SUPABASE_MCP_COMPLETE.md) - Complete MCP guide
- [MIGRATION_STRATEGY.md](../projects/IDSE_Core/sessions/objective/implementation/MIGRATION_STRATEGY.md) - Overall migration plan

**Backend**:
- [backend/routes/mcp_routes.py](../backend/routes/mcp_routes.py) - MCP endpoint implementations
- Backend running on `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

**Orchestrator**:
- `idse-orchestrator/src/idse_orchestrator/` - Package source
- `idse-orchestrator/README.md` - Package documentation

**Supabase**:
- URL: `https://spxovndsgpzvcztbkjel.supabase.co`
- Table: `projects`
- Credentials in `.env`

---

## 🚨 Important Notes

1. **Virtual Environment**: Always activate `.venv-orchestrator/` before working on orchestrator
2. **Backend Must Be Running**: `python3 -m uvicorn backend.main:app --reload`
3. **Supabase Connection**: Already configured in `.env`
4. **No Breaking Changes**: Don't modify backend or governance files
5. **Test Thoroughly**: Both tasks need end-to-end testing

---

## 🎯 Success Criteria

**Task A Complete When**:
- CLI commands sync successfully with Supabase
- Can push local changes to cloud
- Can pull cloud changes to local
- No errors or warnings

**Task B Complete When**:
- Dashboard displays all projects
- Stage completion visualized
- Click-through to detail view works
- Runs without errors

---

## 💬 Questions?

If you encounter issues:
1. Check backend is running: `curl http://localhost:8000/sync/health`
2. Check Supabase connection: Look for `"supabase_connected": true`
3. Check orchestrator venv: `which python` should show `.venv-orchestrator`
4. Read error messages carefully - they're usually descriptive

---

## 📝 When You're Done

Create handoff document back to me with:
1. What you implemented
2. Test results (screenshots welcome!)
3. Any issues encountered
4. Any improvements you made beyond the spec

Looking forward to seeing the CLI integration and dashboard! 🚀

---

**Handoff created by**: Claude Code
**Next agent**: GPT Codex
**Estimated effort**: 3-4 hours for both tasks
**Priority**: Task A first, then Task B
