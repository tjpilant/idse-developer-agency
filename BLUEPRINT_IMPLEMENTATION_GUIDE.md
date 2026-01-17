# IDD Blueprint System - Implementation Guide for Codex

**Date**: 2026-01-12
**Target**: Phase 2.6 - IDD Blueprint System
**Scope**: Add blueprint session support WITHOUT migrating existing project content

---

## 🚨 IMMEDIATE ACTION REQUIRED

**Current Status**: Frontend and backend code is implemented, but **database migrations have NOT been run yet**. This is causing 500 errors in the browser.

**Error in Console**:
```
GET http://127.0.0.1:8000/sync/status/{project_id}/puck-components 500 (Internal Server Error)
```

**Root Cause**: The `sessions` table doesn't have the `state_json` and `is_blueprint` columns yet.

### Quick Fix (5 minutes)

1. **Run Migration 008** (adds columns to sessions table):
   - Open: https://supabase.com/dashboard/project/spxovndsgpzvcztbkjel/sql
   - Copy contents of: `backend/supabase/migrations/008_add_session_state.sql`
   - Paste and click "Run"
   - Verify: Should see "Migration 008: Session state tracking added successfully"

2. **Run Migration 009** (seeds blueprint sessions):
   - Same SQL Editor: https://supabase.com/dashboard/project/spxovndsgpzvcztbkjel/sql
   - Copy contents of: `backend/supabase/migrations/009_seed_blueprint_sessions.sql`
   - Paste and click "Run"
   - Verify: Should see table showing blueprint sessions for all projects

3. **Refresh Browser**:
   - Reload the frontend
   - Session Status card should now show real data (not 500 error)
   - SessionSelector should show "📘 Project Blueprint (IDD)" option

**That's it!** The rest of the implementation is already complete.

---

## 🎯 Implementation Overview

This guide provides **ordered, production-ready steps** to implement the IDD Blueprint system. All edge cases, state wiring, and migration concerns from the deep-dive are addressed.

---

## 📋 Migration Strategy

### Current Migration Head
- **Latest**: `007_fix_project_research_tools.sql`
- **Next**: `008_add_session_state.sql`, `009_seed_blueprint_sessions.sql`

### Idempotency Strategy
All migrations use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, and conditional checks to ensure safe re-runs.

---

## 🔢 Implementation Order (CRITICAL - Follow Exactly)

### Phase 1: Backend Migrations (Database Schema)
1. Run `008_add_session_state.sql` (adds state_json + is_blueprint to sessions)
2. Run `009_seed_blueprint_sessions.sql` (creates __blueprint__ sessions for all projects)

### Phase 2: Backend API (New Endpoints)
3. Add session status **READ** endpoint: `GET /sync/status/{project_id}/{session_id}`
4. Add session state **WRITE** endpoint: `PUT /sync/status/{project_id}/{session_id}`
5. Add document list endpoint: `GET /api/documents/{project}/{session}?list_stages=true`

### Phase 3: Frontend Components (UI Changes)
6. Update `IDSEProjectsDashboard.tsx` (add session status loading)
7. Update `SessionSelector.tsx` (add blueprint option)
8. Update `MDWorkspace.tsx` (handle blueprint document loading)

### Phase 4: Testing & Verification
9. Backend tests (endpoint responses, state updates)
10. Frontend tests (component rendering, state wiring)
11. Integration tests (full workflow)

---

## 📁 Detailed Implementation Steps

---

## PHASE 1: Backend Migrations

### Step 1.1: Create Migration 008 - Add Session State

**File**: `backend/supabase/migrations/008_add_session_state.sql`

```sql
-- Migration 008: Add state tracking to sessions table
-- Run AFTER: 007_fix_project_research_tools.sql
-- Idempotent: Safe to re-run

-- Add state_json column for per-session pipeline tracking
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS state_json JSONB DEFAULT '{
  "stages": {
    "intent": "pending",
    "context": "pending",
    "spec": "pending",
    "plan": "pending",
    "tasks": "pending",
    "implementation": "pending",
    "feedback": "pending"
  },
  "last_agent": null,
  "progress_percent": 0
}'::jsonb;

-- Add is_blueprint flag for identifying project-level blueprint sessions
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS is_blueprint BOOLEAN DEFAULT FALSE;

-- Index for efficient state queries
CREATE INDEX IF NOT EXISTS idx_sessions_state
ON sessions USING GIN (state_json);

-- Index for blueprint filtering
CREATE INDEX IF NOT EXISTS idx_sessions_blueprint
ON sessions (project_id, is_blueprint)
WHERE is_blueprint = TRUE;

-- Add updated_at trigger to track state changes
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sessions_updated_at_trigger ON sessions;
CREATE TRIGGER sessions_updated_at_trigger
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_sessions_updated_at();

-- Migration complete
SELECT 'Migration 008: Session state tracking added successfully' AS status;
```

**Run Command** (Option 1: Supabase SQL Editor - RECOMMENDED):
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/spxovndsgpzvcztbkjel/sql
2. Click "New Query"
3. Copy the entire contents of `backend/supabase/migrations/008_add_session_state.sql`
4. Paste into the editor
5. Click "Run" (or press Ctrl+Enter)
6. Verify output shows "Migration 008: Session state tracking added successfully"

**Run Command** (Option 2: Command Line - Requires DB Password):
```bash
# Extract project reference from SUPABASE_URL
PROJECT_REF="spxovndsgpzvcztbkjel"

# Run migration (you'll be prompted for database password)
psql "postgresql://postgres:[YOUR_DB_PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres" \
  -f backend/supabase/migrations/008_add_session_state.sql
```

**Note**: Option 1 (SQL Editor) is recommended as it doesn't require database password or psql installation.

---

### Step 1.2: Create Migration 009 - Seed Blueprint Sessions

**File**: `backend/supabase/migrations/009_seed_blueprint_sessions.sql`

```sql
-- Migration 009: Seed __blueprint__ sessions for all projects
-- Run AFTER: 008_add_session_state.sql
-- Idempotent: Safe to re-run (ON CONFLICT DO NOTHING)

-- Create __blueprint__ session for each existing project
INSERT INTO sessions (
  id,
  project_id,
  session_id,
  name,
  owner,
  is_blueprint,
  state_json,
  created_at
)
SELECT
  gen_random_uuid() AS id,
  p.id AS project_id,
  '__blueprint__' AS session_id,
  'Project Blueprint (IDD)' AS name,
  'agency' AS owner,
  TRUE AS is_blueprint,
  '{
    "stages": {
      "intent": "pending",
      "context": "pending",
      "spec": "pending",
      "plan": "pending",
      "tasks": "pending",
      "implementation": "pending",
      "feedback": "pending"
    },
    "last_agent": "system",
    "progress_percent": 0
  }'::jsonb AS state_json,
  NOW() AS created_at
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM sessions s
  WHERE s.project_id = p.id
  AND s.session_id = '__blueprint__'
)
ON CONFLICT (project_id, session_id) DO NOTHING;

-- Verify blueprint sessions created
SELECT
  p.name AS project_name,
  s.session_id,
  s.is_blueprint,
  s.state_json->'stages' AS stages
FROM projects p
JOIN sessions s ON s.project_id = p.id
WHERE s.is_blueprint = TRUE
ORDER BY p.name;

-- Migration complete
SELECT 'Migration 009: Blueprint sessions seeded successfully' AS status;
```

**Run Command** (Option 1: Supabase SQL Editor - RECOMMENDED):
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/spxovndsgpzvcztbkjel/sql
2. Click "New Query"
3. Copy the entire contents of `backend/supabase/migrations/009_seed_blueprint_sessions.sql`
4. Paste into the editor
5. Click "Run" (or press Ctrl+Enter)
6. Verify output shows blueprint sessions for all projects

**Run Command** (Option 2: Command Line):
```bash
psql "postgresql://postgres:[YOUR_DB_PASSWORD]@db.spxovndsgpzvcztbkjel.supabase.co:5432/postgres" \
  -f backend/supabase/migrations/009_seed_blueprint_sessions.sql
```

---

## PHASE 2: Backend API Endpoints

### Step 2.1: Add Session Status READ Endpoint

**File**: `backend/routes/mcp_routes.py`

**Location**: After line 245 (after existing `get_sync_status` function)

**Add this new endpoint**:

```python
@router.get("/status/{project_id}/{session_id}")
async def get_session_sync_status(project_id: str, session_id: str):
    """
    Get sync status for a specific session within a project.

    Args:
        project_id: UUID of the project
        session_id: Session slug (e.g., 'puck-components', '__blueprint__')

    Returns:
        {
            "project_id": str,
            "project_name": str,
            "session_id": str,
            "session_name": str,
            "is_blueprint": bool,
            "last_synced": str,
            "created_at": str,
            "state": dict,  # Stage statuses
            "last_agent": str,
            "progress_percent": int
        }

    Raises:
        404: Project or session not found
        500: Database error
    """
    try:
        # Get project info
        proj_result = supabase.table("projects").select(
            "id, name"
        ).eq("id", project_id).execute()

        if not proj_result.data:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        project = proj_result.data[0]

        # Get session info with state
        sess_result = supabase.table("sessions").select(
            "session_id, name, state_json, updated_at, created_at, is_blueprint"
        ).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not sess_result.data:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found in project '{project['name']}'"
            )

        session = sess_result.data[0]
        state_json = session.get("state_json") or {}

        return {
            "project_id": project["id"],
            "project_name": project["name"],
            "session_id": session["session_id"],
            "session_name": session["name"],
            "is_blueprint": session.get("is_blueprint", False),
            "last_synced": session.get("updated_at"),
            "created_at": session.get("created_at"),
            "state": state_json.get("stages", {}),
            "last_agent": state_json.get("last_agent"),
            "progress_percent": state_json.get("progress_percent", 0)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 2.2: Add Session State WRITE Endpoint

**File**: `backend/routes/mcp_routes.py`

**Location**: After the READ endpoint you just added

**Add this request model** (near the top of the file, around line 40):

```python
class SessionStateUpdate(BaseModel):
    """Request to update session state"""
    stages: Optional[Dict[str, str]] = None  # {"intent": "complete", ...}
    last_agent: Optional[str] = None
    progress_percent: Optional[int] = None
```

**Add this WRITE endpoint**:

```python
@router.put("/status/{project_id}/{session_id}")
async def update_session_sync_status(
    project_id: str,
    session_id: str,
    update: SessionStateUpdate,
    authorization: Optional[str] = Header(None)
):
    """
    Update sync status for a specific session.

    Args:
        project_id: UUID of the project
        session_id: Session slug
        update: SessionStateUpdate with fields to update

    Returns:
        {
            "success": bool,
            "project_id": str,
            "session_id": str,
            "updated_fields": list[str],
            "timestamp": str
        }

    Raises:
        404: Session not found
        400: Invalid state values
        500: Database error
    """
    try:
        # Validate session exists
        sess_check = supabase.table("sessions").select(
            "id, state_json"
        ).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not sess_check.data:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found"
            )

        # Get current state_json
        current_state = sess_check.data[0].get("state_json") or {}
        updated_fields = []

        # Update stages if provided
        if update.stages is not None:
            # Validate stage names and statuses
            valid_stages = {"intent", "context", "spec", "plan", "tasks", "implementation", "feedback"}
            valid_statuses = {"pending", "in_progress", "complete", "completed"}

            for stage, status in update.stages.items():
                if stage not in valid_stages:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid stage name: {stage}"
                    )
                if status not in valid_statuses:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid status for {stage}: {status}"
                    )

            # Merge with existing stages
            current_state["stages"] = {**current_state.get("stages", {}), **update.stages}
            updated_fields.append("stages")

        # Update last_agent if provided
        if update.last_agent is not None:
            current_state["last_agent"] = update.last_agent
            updated_fields.append("last_agent")

        # Update progress_percent if provided
        if update.progress_percent is not None:
            if not (0 <= update.progress_percent <= 100):
                raise HTTPException(
                    status_code=400,
                    detail="progress_percent must be between 0 and 100"
                )
            current_state["progress_percent"] = update.progress_percent
            updated_fields.append("progress_percent")

        # Calculate progress if stages were updated but progress wasn't
        if "stages" in updated_fields and "progress_percent" not in updated_fields:
            stages = current_state.get("stages", {})
            total = len(stages)
            complete = sum(1 for status in stages.values() if status in ["complete", "completed"])
            current_state["progress_percent"] = int((complete / total) * 100) if total > 0 else 0

        # Update database
        result = supabase.table("sessions").update({
            "state_json": current_state
        }).eq("project_id", project_id).eq("session_id", session_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Update failed")

        return {
            "success": True,
            "project_id": project_id,
            "session_id": session_id,
            "updated_fields": updated_fields,
            "timestamp": result.data[0].get("updated_at")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 2.3: Add Document List Endpoint (Optional Enhancement)

**File**: `backend/routes/documents_routes.py`

**Location**: After line 125 (before the `get_document` endpoint)

**Add this endpoint**:

```python
@router.get("/{project}/{session}/list_stages")
async def list_session_documents(project: str, session: str):
    """
    List all documents for a session, grouped by stage.

    Returns:
        {
            "project": str,
            "session": str,
            "stages": {
                "intent": {"exists": bool, "path": str},
                "context": {"exists": bool, "path": str},
                ...
            }
        }
    """
    try:
        supabase = get_supabase_client()
        project_uuid = _resolve_project_uuid(project)

        # Fetch all documents for this session
        resp = (
            supabase.table("documents")
            .select("path, stage")
            .eq("project_id", project_uuid)
            .eq("session_slug", session)
            .execute()
        )

        # Group by stage
        stages_map = {
            "intent": {"exists": False, "path": None},
            "context": {"exists": False, "path": None},
            "spec": {"exists": False, "path": None},
            "plan": {"exists": False, "path": None},
            "tasks": {"exists": False, "path": None},
            "implementation": {"exists": False, "path": None},
            "feedback": {"exists": False, "path": None}
        }

        for doc in (resp.data or []):
            stage = doc.get("stage")
            if stage and stage in stages_map:
                stages_map[stage] = {
                    "exists": True,
                    "path": doc.get("path")
                }

        return {
            "project": project,
            "session": session,
            "stages": stages_map
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Failed to list session documents: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
```

---

## PHASE 3: Frontend Components

### Step 3.1: Update IDSEProjectsDashboard

**File**: `frontend/widget/src/components/IDSEProjectsDashboard.tsx`

#### 3.1.1: Add TypeScript Types (after line 22)

```typescript
interface SessionStatus {
  project_id: string;
  project_name: string;
  session_id: string;
  session_name: string;
  is_blueprint: boolean;
  last_synced?: string;
  created_at?: string;
  state: StageState;
  last_agent?: string;
  progress_percent: number;
}
```

#### 3.1.2: Add State Variable (after line 70)

```typescript
const [selectedSessionStatus, setSelectedSessionStatus] = useState<SessionStatus | null>(null);
```

#### 3.1.3: Add Session Status Loader (after line 115)

```typescript
const loadSessionStatus = useCallback(
  async (projectId: string, sessionId: string) => {
    if (!sessionId) {
      setSelectedSessionStatus(null);
      return;
    }

    setStatusLoading(true);
    try {
      const res = await fetch(`${baseUrl}/sync/status/${projectId}/${sessionId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Session doesn't have state yet (legacy session)
          setSelectedSessionStatus({
            project_id: projectId,
            project_name: currentProject || "",
            session_id: sessionId,
            session_name: sessionId,
            is_blueprint: false,
            state: {},
            progress_percent: 0
          });
          return;
        }
        throw new Error(`Failed to load session status (${res.status})`);
      }
      const data = await res.json();
      setSelectedSessionStatus(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load session status";
      setError(msg);
      setSelectedSessionStatus(null);
    } finally {
      setStatusLoading(false);
    }
  },
  [baseUrl, currentProject]
);
```

#### 3.1.4: Add Effect to Load Session Status (after line 135)

```typescript
// Load session status when session changes
useEffect(() => {
  if (selectedId && currentSession) {
    loadSessionStatus(selectedId, currentSession);
  } else {
    setSelectedSessionStatus(null);
  }
}, [selectedId, currentSession, loadSessionStatus]);
```

#### 3.1.5: Calculate Session Progress (after line 140)

```typescript
// Calculate session progress
const sessionStages = selectedSessionStatus?.state || {};
const sessionProgress = calculateProgress(sessionStages);
```

#### 3.1.6: Update Session Status Card (replace lines 240-275)

```typescript
{/* Session Status Card */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {selectedSessionStatus?.is_blueprint ? "Blueprint Status" : "Session Status"}
      </p>
      <p className="text-lg font-semibold text-slate-900">
        {selectedSessionStatus?.session_name || currentSession || "No session selected"}
      </p>
      <p className="text-xs text-slate-500">
        Project: {currentProject || "Unknown"}
      </p>
    </div>
    <div className="text-right">
      <p className={`text-sm font-semibold ${sessionProgress.percent > 0 ? 'text-cyan-700' : 'text-slate-400'}`}>
        {sessionProgress.percent}% complete
      </p>
      <p className="text-xs text-slate-500">
        {sessionProgress.complete} of {sessionProgress.total} stages
      </p>
    </div>
  </div>

  {/* Session pipeline stages */}
  <div className="mt-4 grid gap-2 md:grid-cols-3">
    {STAGE_ORDER.map((stage) => {
      const status = sessionStages[stage] || "pending";
      const badge =
        status === "complete" || status === "completed"
          ? "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
          : status === "in_progress"
          ? "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200"
          : "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200";

      return (
        <div key={stage} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <p className="text-sm font-semibold text-slate-900 capitalize">{stage}</p>
          <span className={badge}>{status.replace(/_/g, " ")}</span>
        </div>
      );
    })}
  </div>

  <dl className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm text-slate-700">
    <div className="flex items-center justify-between">
      <dt className="text-xs text-slate-500">Session ID</dt>
      <dd className="font-mono text-xs text-slate-600 truncate max-w-[200px]">
        {selectedSessionStatus?.session_id || "N/A"}
      </dd>
    </div>
    <div className="flex items-center justify-between">
      <dt className="text-xs text-slate-500">Last synced</dt>
      <dd className="text-xs">
        {selectedSessionStatus?.last_synced
          ? new Date(selectedSessionStatus.last_synced).toLocaleString()
          : "Not synced"}
      </dd>
    </div>
    {selectedSessionStatus?.is_blueprint && (
      <div className="flex items-center gap-2 pt-2">
        <span className="text-lg">📘</span>
        <span className="text-xs text-slate-600">
          This is the project-level blueprint tracking meta-planning
        </span>
      </div>
    )}
  </dl>
</div>
```

---

### Step 3.2: Update SessionSelector

**File**: `frontend/widget/src/components/SessionSelector.tsx`

#### 3.2.1: Update Import (line 11)

```typescript
import { FolderOpen, Clock, BookOpen } from 'lucide-react';
```

#### 3.2.2: Replace SelectContent (lines 122-142)

```typescript
<SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
  {/* Blueprint Option (if exists) */}
  {projectData?.sessions.some(s => s.session_id === '__blueprint__') && (
    <>
      <SelectGroup>
        <SelectLabel className="text-slate-400 flex items-center gap-2">
          <BookOpen className="h-3 w-3" />
          Project Blueprint
        </SelectLabel>
        <SelectItem
          value="__blueprint__"
          className="text-slate-100 focus:bg-slate-700 focus:text-white"
        >
          <div className="flex items-center gap-2 py-1">
            <span className="text-lg">📘</span>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Project Blueprint (IDD)</span>
              <span className="text-xs text-slate-400">
                Meta-level project planning
              </span>
            </div>
          </div>
        </SelectItem>
      </SelectGroup>
      <div className="h-px bg-slate-700 my-2" />
    </>
  )}

  {/* Regular Sessions */}
  <SelectGroup>
    <SelectLabel className="text-slate-400">Feature Sessions</SelectLabel>
    {projectData?.sessions
      .filter(s => s.session_id !== '__blueprint__')
      .map((session) => (
        <SelectItem
          key={session.session_id}
          value={session.session_id}
          className="text-slate-100 focus:bg-slate-700 focus:text-white"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium">{session.name}</span>
            <span className="text-xs text-slate-400">
              {formatTimestamp(session.created_at)}
              {session.owner && ` • ${session.owner}`}
            </span>
          </div>
        </SelectItem>
      ))}
  </SelectGroup>
</SelectContent>
```

---

### Step 3.3: Update MDWorkspace (Blueprint Document Handling)

**File**: `frontend/widget/src/components/MDWorkspace.tsx` (or wherever MD editor lives)

**Note**: This is optional if MD editor doesn't exist yet. This shows the pattern for handling blueprint documents.

#### 3.3.1: Add Blueprint Document List

```typescript
const BLUEPRINT_DOCUMENTS = [
  { path: 'meta.md', label: 'Meta', stage: 'meta', icon: '📋' },
  { path: 'intents/intent.md', label: 'Intent', stage: 'intent', icon: '🎯' },
  { path: 'contexts/context.md', label: 'Context', stage: 'context', icon: '🌍' },
  { path: 'specs/spec.md', label: 'Specification', stage: 'spec', icon: '📐' },
  { path: 'plans/plan.md', label: 'Plan', stage: 'plan', icon: '🗺️' },
  { path: 'tasks/tasks.md', label: 'Tasks', stage: 'tasks', icon: '✅' },
  { path: 'implementation/README.md', label: 'Implementation', stage: 'implementation', icon: '🔧' },
  { path: 'feedback/feedback.md', label: 'Feedback', stage: 'feedback', icon: '💬' }
];

const REGULAR_DOCUMENTS = [
  { path: 'intents/intent.md', label: 'Intent', stage: 'intent', icon: '🎯' },
  { path: 'contexts/context.md', label: 'Context', stage: 'context', icon: '🌍' },
  { path: 'specs/spec.md', label: 'Specification', stage: 'spec', icon: '📐' },
  { path: 'plans/plan.md', label: 'Plan', stage: 'plan', icon: '🗺️' },
  { path: 'tasks/tasks.md', label: 'Tasks', stage: 'tasks', icon: '✅' },
  { path: 'feedback/feedback.md', label: 'Feedback', stage: 'feedback', icon: '💬' }
];
```

#### 3.3.2: Detect Blueprint Session

```typescript
const isBlueprintSession = currentSession === '__blueprint__';
const documentsToShow = isBlueprintSession ? BLUEPRINT_DOCUMENTS : REGULAR_DOCUMENTS;
```

#### 3.3.3: Render Document Sidebar

```typescript
<div className="space-y-1">
  <div className="px-3 py-2 border-b border-slate-700">
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
      {isBlueprintSession ? '📘 Blueprint Documents' : '📄 Session Documents'}
    </h3>
    {isBlueprintSession && (
      <p className="text-[10px] text-slate-500 mt-1">
        Project-level planning and meta-documentation
      </p>
    )}
  </div>

  {documentsToShow.map(doc => (
    <button
      key={doc.path}
      onClick={() => loadDocument(currentProject, currentSession, doc.path)}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
    >
      <span className="text-base">{doc.icon}</span>
      <span className="flex-1 text-left">{doc.label}</span>
    </button>
  ))}
</div>
```

#### 3.3.4: Handle 404s for Missing Blueprint Documents

```typescript
const loadDocument = async (project: string, session: string, path: string) => {
  try {
    const response = await fetch(`/api/documents/${project}/${session}/${path}`);

    if (!response.ok) {
      if (response.status === 404) {
        // Document doesn't exist yet
        setDocumentContent(`# ${path}\n\nThis document hasn't been created yet.`);
        setIsEmpty(true);
        return;
      }
      throw new Error(`Failed to load document: ${response.statusText}`);
    }

    const data = await response.json();
    setDocumentContent(data.content || '');
    setIsEmpty(false);
  } catch (error) {
    console.error('Error loading document:', error);
    setError(error.message);
  }
};
```

---

## PHASE 4: Testing & Verification

### Step 4.1: Backend Endpoint Tests

**File**: `backend/tests/test_blueprint_endpoints.py` (NEW)

```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_session_status_blueprint():
    """Test fetching blueprint session status"""
    # Assumes project exists with UUID
    project_id = "test-project-uuid"
    session_id = "__blueprint__"

    response = client.get(f"/sync/status/{project_id}/{session_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["session_id"] == "__blueprint__"
    assert data["is_blueprint"] is True
    assert "state" in data
    assert "progress_percent" in data

def test_get_session_status_regular():
    """Test fetching regular session status"""
    project_id = "test-project-uuid"
    session_id = "test-session"

    response = client.get(f"/sync/status/{project_id}/{session_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["is_blueprint"] is False

def test_update_session_status():
    """Test updating session state"""
    project_id = "test-project-uuid"
    session_id = "test-session"

    update_data = {
        "stages": {
            "intent": "complete",
            "context": "in_progress"
        },
        "last_agent": "claude"
    }

    response = client.put(
        f"/sync/status/{project_id}/{session_id}",
        json=update_data
    )
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "intent" in data["updated_fields"] or "stages" in data["updated_fields"]

def test_update_invalid_stage():
    """Test validation of invalid stage names"""
    project_id = "test-project-uuid"
    session_id = "test-session"

    update_data = {
        "stages": {
            "invalid_stage": "complete"
        }
    }

    response = client.put(
        f"/sync/status/{project_id}/{session_id}",
        json=update_data
    )
    assert response.status_code == 400
    assert "Invalid stage name" in response.json()["detail"]

def test_session_not_found():
    """Test 404 for non-existent session"""
    response = client.get("/sync/status/fake-id/fake-session")
    assert response.status_code == 404
```

**Run Tests**:
```bash
pytest backend/tests/test_blueprint_endpoints.py -v
```

---

### Step 4.2: Frontend Component Tests

**File**: `frontend/widget/src/components/__tests__/IDSEProjectsDashboard.test.tsx` (NEW)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { IDSEProjectsDashboard } from '../IDSEProjectsDashboard';

// Mock fetch
global.fetch = jest.fn();

describe('IDSEProjectsDashboard - Blueprint Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays session status', async () => {
    const mockSessionStatus = {
      project_id: '123',
      project_name: 'Test Project',
      session_id: '__blueprint__',
      session_name: 'Project Blueprint (IDD)',
      is_blueprint: true,
      state: {
        intent: 'complete',
        context: 'in_progress',
        spec: 'pending'
      },
      progress_percent: 29
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSessionStatus
    });

    render(
      <IDSEProjectsDashboard
        currentProject="Test Project"
        currentSession="__blueprint__"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Blueprint Status')).toBeInTheDocument();
      expect(screen.getByText('29% complete')).toBeInTheDocument();
    });
  });

  it('handles session status 404 gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(
      <IDSEProjectsDashboard
        currentProject="Test Project"
        currentSession="legacy-session"
      />
    );

    await waitFor(() => {
      // Should show 0% for legacy sessions without state
      expect(screen.getByText('0% complete')).toBeInTheDocument();
    });
  });
});
```

**Run Tests**:
```bash
cd frontend/widget
npm test -- IDSEProjectsDashboard.test.tsx
```

---

### Step 4.3: Integration Test Workflow

**Manual Test Checklist**:

1. **Backend Migration**:
   ```bash
   psql $SUPABASE_URL -f backend/supabase/migrations/008_add_session_state.sql
   psql $SUPABASE_URL -f backend/supabase/migrations/009_seed_blueprint_sessions.sql
   ```

2. **Verify Blueprint Sessions Created**:
   ```sql
   SELECT p.name, s.session_id, s.is_blueprint
   FROM projects p
   JOIN sessions s ON s.project_id = p.id
   WHERE s.is_blueprint = TRUE;
   ```
   Expected: One `__blueprint__` session per project

3. **Start Backend**:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

4. **Test READ Endpoint**:
   ```bash
   # Replace {project_id} with actual UUID
   curl http://localhost:8000/sync/status/{project_id}/__blueprint__
   ```
   Expected: JSON with `is_blueprint: true`, `state: {...}`

5. **Test WRITE Endpoint**:
   ```bash
   curl -X PUT http://localhost:8000/sync/status/{project_id}/__blueprint__ \
     -H "Content-Type: application/json" \
     -d '{"stages": {"intent": "complete"}, "last_agent": "claude"}'
   ```
   Expected: `{"success": true, ...}`

6. **Start Frontend**:
   ```bash
   cd frontend/widget
   npm run dev
   ```

7. **Test UI Workflow**:
   - Open SessionSelector
   - Verify "📘 Project Blueprint (IDD)" appears at top
   - Select blueprint session
   - Dashboard Session Status card should show real data (not 0%)
   - Switch to regular session
   - Session Status card should update

---

## 🔧 State Wiring & Component Communication

### Data Flow Diagram

```
AdminDashboard (parent)
│
├── currentProject (prop) ────────┐
├── currentSession (prop) ────────┤
│                                  │
├─> SessionSelector               │
│   └── onSessionChange() ────────┤─> Updates parent state
│                                  │
├─> IDSEProjectsDashboard         │
│   ├── Receives: currentProject ─┘
│   ├── Receives: currentSession
│   │
│   ├── useEffect(() => {
│   │     loadSessionStatus(selectedId, currentSession);
│   │   }, [currentSession])
│   │
│   └── Session Status Card
│       └── Displays: selectedSessionStatus
│
└─> MDWorkspace
    ├── Receives: currentProject
    ├── Receives: currentSession
    └── Conditional rendering based on session === '__blueprint__'
```

### Critical State Synchronization

**Parent Component** (`AdminDashboard.tsx`):
```typescript
const [currentProject, setCurrentProject] = useState('IDSE_Core');
const [currentSession, setCurrentSession] = useState('__blueprint__');

const handleSessionChange = (project: string, session: string) => {
  setCurrentProject(project);
  setCurrentSession(session);
  // All child components receive updated props and re-render
};
```

**Child Components** must:
1. Accept `currentProject` and `currentSession` as props
2. Use `useEffect` to trigger data loads when these props change
3. NOT maintain separate copies of these values
4. Pass state changes UP via callbacks (one-way data flow)

---

## 🚨 Edge Cases & Error Handling

### 1. Legacy Sessions Without state_json

**Problem**: Existing sessions created before migration 008 won't have `state_json`.

**Solution**: Migration 008 adds `DEFAULT` value, so all rows get state_json immediately.

**Verification**:
```sql
SELECT session_id, state_json IS NULL AS missing_state
FROM sessions
WHERE state_json IS NULL;
```
Expected: 0 rows

---

### 2. Session Status 404

**Problem**: Frontend calls `/sync/status/{project}/{session}` but session doesn't exist.

**Solution**: Already handled in `loadSessionStatus()` (Step 3.1.3):
```typescript
if (res.status === 404) {
  // Show empty state with 0%
  setSelectedSessionStatus({ ... });
  return;
}
```

---

### 3. Blueprint Session Missing

**Problem**: User selects project but `__blueprint__` session wasn't seeded.

**Solution**:
- Migration 009 is idempotent (safe to re-run)
- SessionSelector only shows blueprint option if it exists:
  ```typescript
  {projectData?.sessions.some(s => s.session_id === '__blueprint__') && ( ... )}
  ```

**Recovery**:
```bash
# Re-run migration 009 to backfill
psql $SUPABASE_URL -f backend/supabase/migrations/009_seed_blueprint_sessions.sql
```

---

### 4. Concurrent State Updates

**Problem**: Two agents update session state simultaneously.

**Solution**: PostgreSQL row-level locking prevents corruption. Last write wins. No conflict resolution needed for MVP.

**Future Enhancement**: Add optimistic locking with `version` field.

---

### 5. MD Editor Document 404

**Problem**: User clicks "Intent" in blueprint but `intents/intent.md` doesn't exist yet.

**Solution**: Handled in `loadDocument()` (Step 3.3.4):
```typescript
if (response.status === 404) {
  setDocumentContent(`# ${path}\n\nThis document hasn't been created yet.`);
  setIsEmpty(true);
}
```

---

## 📊 Progress Calculation Logic

### Automatic Progress Calculation

When session stages are updated via `PUT /sync/status/{project}/{session}`, the endpoint automatically calculates `progress_percent`:

```python
if "stages" in updated_fields and "progress_percent" not in updated_fields:
    stages = current_state.get("stages", {})
    total = len(stages)
    complete = sum(1 for status in stages.values() if status in ["complete", "completed"])
    current_state["progress_percent"] = int((complete / total) * 100) if total > 0 else 0
```

### Valid Stage Statuses

- `"pending"` - Not started
- `"in_progress"` - Currently working
- `"complete"` / `"completed"` - Finished (both count as 100%)

---

## 🔐 Authorization & RLS (Future)

**Current State**: No RLS policies, all endpoints use service role key.

**Future Enhancement** (Phase 3):
```sql
-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see sessions for their assigned projects
CREATE POLICY sessions_select_policy ON sessions
FOR SELECT
USING (
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Agents can update any session (via service role)
CREATE POLICY sessions_update_policy ON sessions
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

---

## 📝 Blueprint Document Seeding (Optional)

If you want to pre-populate blueprint documents with templates:

**File**: `backend/scripts/seed_blueprint_documents.py` (NEW)

```python
#!/usr/bin/env python3
"""
Seed blueprint documents for all projects.
Run AFTER migrations 008 and 009.
"""

from backend.services.supabase_client import get_supabase_client
import uuid

BLUEPRINT_TEMPLATES = {
    "meta.md": """# Meta: {project_name}

This document aggregates learnings and decisions from all feature sessions.

## Overview
[Project overview]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]
""",
    "intents/intent.md": """# Intent: {project_name}

## Vision
[What we're building and why]

## Success Criteria
- [Criterion 1]
- [Criterion 2]
""",
    "contexts/context.md": """# Context: {project_name}

## Constraints
- [Constraint 1]

## Assumptions
- [Assumption 1]
""",
    # Add more templates...
}

def seed_blueprint_documents():
    supabase = get_supabase_client()

    # Get all projects with blueprint sessions
    projects = supabase.table("projects").select("id, name").execute()

    for project in projects.data:
        project_id = project["id"]
        project_name = project["name"]

        print(f"Seeding blueprint documents for {project_name}...")

        for path, template in BLUEPRINT_TEMPLATES.items():
            content = template.format(project_name=project_name)
            stage = path.split("/")[0] if "/" in path else "meta"

            # Insert document
            supabase.table("documents").upsert({
                "id": str(uuid.uuid4()),
                "project_id": project_id,
                "session_slug": "__blueprint__",
                "path": path,
                "stage": stage,
                "content": content
            }, on_conflict="project_id,session_slug,path").execute()

        print(f"  ✓ Seeded {len(BLUEPRINT_TEMPLATES)} documents")

    print("Done!")

if __name__ == "__main__":
    seed_blueprint_documents()
```

**Run**:
```bash
python3 backend/scripts/seed_blueprint_documents.py
```

---

## ✅ Acceptance Criteria

### Backend Complete When:
- [ ] Migration 008 run successfully (state_json + is_blueprint added)
- [ ] Migration 009 run successfully (blueprint sessions created for all projects)
- [ ] Verify query returns data:
  ```sql
  SELECT COUNT(*) FROM sessions WHERE is_blueprint = TRUE;
  ```
- [ ] `GET /sync/status/{project_id}/__blueprint__` returns 200
- [ ] `PUT /sync/status/{project_id}/__blueprint__` updates state and returns 200
- [ ] Invalid stage names return 400
- [ ] Non-existent sessions return 404

### Frontend Complete When:
- [ ] SessionSelector shows "📘 Project Blueprint (IDD)" at top (if blueprint exists)
- [ ] Selecting blueprint updates `currentSession` to `"__blueprint__"`
- [ ] Dashboard Session Status card shows real blueprint progress (not 0%)
- [ ] Dashboard Session Status card label changes to "Blueprint Status"
- [ ] Selecting regular session shows session-specific progress
- [ ] 404 errors handled gracefully (shows 0% with message)
- [ ] MD Editor (if exists) shows blueprint document list when `currentSession === '__blueprint__'`

### Integration Complete When:
- [ ] Full workflow tested end-to-end:
  1. Select project in SessionSelector
  2. Blueprint session appears at top
  3. Click blueprint → Dashboard updates
  4. Session Status shows real progress
  5. Switch to regular session → Dashboard updates again
  6. Both cards show different data correctly

---

## 🐛 Debugging Guide

### Issue: SessionSelector doesn't show blueprint option

**Check**:
```sql
SELECT * FROM sessions WHERE session_id = '__blueprint__';
```

**Fix**: Re-run migration 009

---

### Issue: Session Status shows 0% for blueprint

**Check**: Call API directly:
```bash
curl http://localhost:8000/sync/status/{project_uuid}/__blueprint__
```

**If 404**: Session doesn't exist (re-run migration 009)
**If 200 but all "pending"**: Expected behavior - state hasn't been updated yet
**If 500**: Check backend logs

---

### Issue: Dashboard doesn't update when switching sessions

**Check**: React DevTools → Verify `currentSession` prop changes

**Fix**: Ensure `AdminDashboard` passes props correctly:
```typescript
<IDSEProjectsDashboard
  currentProject={currentProject}  // Must update
  currentSession={currentSession}   // Must update
/>
```

---

### Issue: State updates don't persist

**Check**: Call PUT endpoint:
```bash
curl -X PUT http://localhost:8000/sync/status/{id}/__blueprint__ \
  -H "Content-Type: application/json" \
  -d '{"stages": {"intent": "complete"}}'
```

**If 404**: Session doesn't exist
**If 400**: Invalid stage name or status
**If 500**: Database connection issue

---

## 📚 Summary for Codex

**What You're Building**:
- Blueprint sessions (`__blueprint__`) for project-level meta-planning
- Backend API to read/write session state
- Frontend UI to display blueprint vs. feature session progress
- SessionSelector option to switch between blueprint and regular sessions

**What You're NOT Doing**:
- Migrating existing project content from `projects/IDSE_Core/sessions/objective/`
- Complex progress roll-up calculations
- RLS policies (future work)
- Multi-tenant authorization (future work)

**Implementation Order** (CRITICAL):
1. Migrations first (008, 009)
2. Backend endpoints second (read, then write)
3. Frontend components third (dashboard, selector, MD editor)
4. Tests last

**Key Files to Modify**:
- `backend/supabase/migrations/008_add_session_state.sql` (NEW)
- `backend/supabase/migrations/009_seed_blueprint_sessions.sql` (NEW)
- `backend/routes/mcp_routes.py` (add 2 endpoints)
- `frontend/widget/src/components/IDSEProjectsDashboard.tsx` (update)
- `frontend/widget/src/components/SessionSelector.tsx` (update)
- `frontend/widget/src/components/MDWorkspace.tsx` (update, if exists)

**Success Metric**:
User can select "📘 Project Blueprint (IDD)" in SessionSelector and see real pipeline progress in Dashboard (not hardcoded 0%).

---

**Questions? Check**:
- Main plan: `/home/tjpilant/.claude/plans/crystalline-kindling-lovelace.md`
- This guide: `/home/tjpilant/projects/idse-developer-agency/BLUEPRINT_IMPLEMENTATION_GUIDE.md`
- Governance: `.idse/governance/IDSE_CONSTITUTION.md`

**Good luck! 🚀**
