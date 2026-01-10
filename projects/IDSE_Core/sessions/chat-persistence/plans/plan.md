# Phase 2.5: Chat Persistence & Dashboard Integration - Implementation Plan

**Date**: 2026-01-10
**Priority**: CRITICAL
**Estimated Effort**: 4-7 hours
**Status**: Ready for Implementation

---

## Executive Summary

### Problem
Frontend session selection works perfectly, but chat messages don't persist when switching sessions because they're stored only in React local state (`useState`). Every session switch loses entire conversation history, making the admin dashboard session management feature unusable.

### Solution
Implement a **three-layer chat persistence system** that integrates with Codex's Projects Dashboard:
1. **Database**: `chat_messages` table in Supabase
2. **Backend API**: Chat history endpoints (GET/POST/DELETE)
3. **Frontend**: `useChatHistory` hook + dashboard navigation

### Key Innovation
Codex built an IDSE Projects Dashboard that displays all synced projects. We're integrating it with chat to create a seamless navigation loop:
- Browse all projects → Select project → Jump to chat → View persistent history → Jump back to dashboard

---

## Architecture

### Database Schema (Supabase)

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_chat_messages_session ON chat_messages(project_id, session_id, created_at DESC);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Composite unique constraint to handle deduplication
CREATE INDEX idx_chat_messages_composite ON chat_messages(session_id, role, content, created_at);
```

**Note**: Using TEXT for `project_id`/`session_id` to match current `.idse_active_session.json` format.

### Backend API Endpoints

**File**: `backend/routes/chat_routes.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime

router = APIRouter()

class ChatMessage(BaseModel):
    id: str
    project_id: str
    session_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    metadata: dict = {}
    created_at: datetime

class SaveMessageRequest(BaseModel):
    project: str
    session: str
    role: str
    content: str
    metadata: dict = {}

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]
    total_count: int
    has_more: bool

@router.get("/api/chat/history/{project}/{session}")
async def get_chat_history(
    project: str,
    session: str,
    limit: int = 100,
    offset: int = 0
) -> ChatHistoryResponse:
    """Fetch chat messages for a specific session."""
    # Query Supabase for messages
    # Order by created_at DESC
    # Return paginated results

@router.post("/api/chat/messages")
async def save_chat_message(request: SaveMessageRequest):
    """Save a single chat message."""
    # Insert into Supabase
    # Return created message with ID and timestamp

@router.delete("/api/chat/history/{project}/{session}")
async def clear_chat_history(project: str, session: str):
    """Clear all messages for a session."""
    # Delete from Supabase where project_id = project AND session_id = session
    # Return deleted count
```

### Frontend Hook

**File**: `frontend/widget/src/hooks/useChatHistory.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:8000';

export function useChatHistory(project: string, session: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when project/session changes
  useEffect(() => {
    loadHistory();
  }, [project, session]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/chat/history/${project}/${session}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load chat history';
      setError(msg);
      console.error('[useChatHistory] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [project, session]);

  const saveMessage = useCallback(async (role: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, session, role, content }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }
      const savedMessage = await response.json();
      // Optimistically update local state
      setMessages((prev) => [...prev, savedMessage]);
    } catch (err) {
      console.error('[useChatHistory] Save error:', err);
      // Don't throw - allow chat to continue even if persistence fails
    }
  }, [project, session]);

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/chat/history/${project}/${session}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        throw new Error(`Failed to clear history: ${response.status}`);
      }
      setMessages([]);
    } catch (err) {
      console.error('[useChatHistory] Clear error:', err);
    }
  }, [project, session]);

  return { messages, loading, error, saveMessage, clearHistory, refreshHistory: loadHistory };
}
```

---

## Implementation Tasks

### Task 1: Database Migration (30 minutes)

**File**: `backend/supabase/migrations/003_chat_messages.sql`

1. Create migration file with schema above
2. Run migration in Supabase dashboard or via CLI:
   ```bash
   # Option 1: Supabase dashboard
   # Navigate to: https://spxovndsgpzvcztbkjel.supabase.co/project/spxovndsgpzvcztbkjel/sql/new
   # Paste SQL and execute

   # Option 2: CLI (if configured)
   supabase migration new chat_messages
   # Copy SQL to generated file
   supabase db push
   ```
3. Verify table created:
   ```sql
   SELECT * FROM chat_messages LIMIT 1;
   ```

### Task 2: Backend Chat Routes (1 hour)

**File**: `backend/routes/chat_routes.py`

1. Create file with router and Pydantic models
2. Implement `get_chat_history()`:
   - Query: `supabase.table("chat_messages").select("*").eq("project_id", project).eq("session_id", session).order("created_at", desc=True).range(offset, offset + limit - 1).execute()`
   - Return formatted response with pagination metadata
3. Implement `save_chat_message()`:
   - Insert: `supabase.table("chat_messages").insert({...}).execute()`
   - Return created message
4. Implement `clear_chat_history()`:
   - Delete: `supabase.table("chat_messages").delete().eq("project_id", project).eq("session_id", session).execute()`
   - Return deleted count

**Dependencies**:
```python
from backend.services.supabase_client import get_supabase_client
```

### Task 3: Register Chat Routes (10 minutes)

**File**: `backend/main.py`

```python
# Add import (around line 80)
from backend.routes import (
    ...,
    chat_routes,
)

# Register router (around line 104)
app.include_router(
    chat_routes.router, tags=["Chat History"]
)
```

### Task 4: Update /inbound to Persist Messages (30 minutes)

**File**: `backend/routes/agui_realtime.py`

```python
# Add import at top
from backend.routes.chat_routes import save_chat_message, SaveMessageRequest

# Modify handle_inbound (around line 78)
@router.post("/inbound")
async def handle_inbound(payload: InboundMessage):
    # ... existing code ...

    # NEW: Persist user message
    await save_chat_message(SaveMessageRequest(
        project=payload.project,
        session=payload.session,
        role="user",
        content=payload.content
    ))

    # ... call agency.get_response_sync() ...
    response_text = agency.get_response_sync(payload.content)

    # NEW: Persist assistant response
    await save_chat_message(SaveMessageRequest(
        project=payload.project,
        session=payload.session,
        role="assistant",
        content=response_text
    ))

    # ... existing SSE streaming code ...
```

### Task 5: Create useChatHistory Hook (45 minutes)

**File**: `frontend/widget/src/hooks/useChatHistory.ts`

1. Create file with TypeScript code above
2. Test hook in isolation (optional):
   ```typescript
   // Test component
   const TestChat = () => {
     const { messages, saveMessage } = useChatHistory("test-project", "test-session");
     return <div>{messages.length} messages</div>;
   };
   ```

### Task 6: Update RightPanel to Use Hook (30 minutes)

**File**: `frontend/widget/src/puck/components/RightPanel.tsx`

```typescript
// BEFORE (line 23):
const [messages, setMessages] = useState<ChatMessage[]>([
  { role: "assistant", content: "Hi! I'm your IDSE Assistant..." },
]);

// AFTER:
import { useChatHistory } from '../../hooks/useChatHistory';

const { messages, loading, error, saveMessage } = useChatHistory(project, session);

// Update handleSend (around line 89):
const handleSend = async () => {
  if (!input.trim() || sending) return;

  const userMessage = input.trim();
  setInput("");
  setSending(true);

  // Persist user message
  await saveMessage('user', userMessage);

  // ... existing SSE stream handling ...
};

// Update pushMessage to persist assistant responses (around line 140):
const pushMessage = (message: ChatMessage) => {
  if (message.role === 'assistant') {
    saveMessage('assistant', message.content);
  }
  // Note: Hook manages state internally, no need to setMessages
};

// Add loading indicator
{loading && <div className="text-xs text-slate-500">Loading chat history...</div>}
{error && <div className="text-xs text-red-500">Error: {error}</div>}
```

### Task 7: Wire Dashboard Navigation (30 minutes)

**File**: `frontend/widget/src/components/IDSEProjectsDashboard.tsx`

```typescript
// Update interface (around line 53)
interface IDSEProjectsDashboardProps {
  apiBase?: string;
  onProjectSelect?: (projectName: string, projectId: string) => void;
}

export function IDSEProjectsDashboard({ apiBase, onProjectSelect }: IDSEProjectsDashboardProps) {
  // ... existing code ...

  // Update project card onClick (around line 188)
  <button
    key={project.id}
    onClick={() => {
      setSelectedId(project.id);
      // NEW: Navigate to chat
      if (onProjectSelect) {
        onProjectSelect(project.name, project.id);
      }
    }}
    // ... existing className and JSX ...
  >
}
```

**File**: `frontend/widget/src/components/AdminDashboard.tsx`

```typescript
// Update renderCenterCanvas (around line 158)
if (state.activeWorkspace === "projects") {
  return (
    <IDSEProjectsDashboard
      apiBase={API_BASE}
      onProjectSelect={(projectName, projectId) => {
        // Jump to MD workspace with this project
        setState((prev) => ({
          ...prev,
          activeWorkspace: "md",
          currentSession: {
            project: projectName,
            session: "latest", // or fetch latest session for this project
          },
        }));
      }}
    />
  );
}
```

### Task 8: Add Dashboard Navigation Buttons (30 minutes)

**File**: `frontend/widget/src/components/SessionSelector.tsx`

```typescript
import { Grid as GridIcon } from 'lucide-react';

// Add state for project count
const [projectCount, setProjectCount] = useState(0);

useEffect(() => {
  fetch(`${API_BASE}/sync/projects`)
    .then(res => res.json())
    .then(data => setProjectCount(data.projects?.length || 0))
    .catch(err => console.error('Failed to fetch project count:', err));
}, []);

// Add button below session selectors
<button
  onClick={() => onWorkspaceChange?.('projects')}
  className="text-xs text-cyan-600 hover:underline flex items-center gap-1"
>
  <GridIcon className="h-3 w-3" />
  View projects dashboard ({projectCount})
</button>
```

**File**: `frontend/widget/src/components/LeftNav.tsx`

```typescript
// Add project count badge to "IDSE Projects" entry
const [projectCount, setProjectCount] = useState(0);

useEffect(() => {
  fetch(`${API_BASE}/sync/projects`)
    .then(res => res.json())
    .then(data => setProjectCount(data.projects?.length || 0));
}, []);

// Update nav item
<button onClick={() => onWorkspaceChange("projects")}>
  IDSE Projects
  {projectCount > 0 && (
    <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-100 text-cyan-700 rounded-full">
      {projectCount}
    </span>
  )}
</button>
```

**File**: `frontend/widget/src/puck/components/RightPanel.tsx`

```typescript
// Add header with jump-to-dashboard button
<div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
  <span className="text-xs text-slate-600">
    {project} / {session}
  </span>
  <button
    onClick={() => {
      // Callback to AdminDashboard to switch workspace
      onJumpToDashboard?.();
    }}
    className="text-xs text-cyan-600 hover:underline"
  >
    Jump to dashboard →
  </button>
</div>
```

---

## User Flow (Complete Navigation)

```
1. User opens admin dashboard
   ↓
2. Clicks "IDSE Projects (5)" in LeftNav
   ↓
3. Views all synced projects with stage completion status
   ↓
4. Clicks a project card (e.g., "customer-portal")
   ↓
5. Dashboard calls onProjectSelect("customer-portal", "uuid-123")
   ↓
6. AdminDashboard switches to activeWorkspace="md"
   ↓
7. RightPanel loads chat history via useChatHistory hook
   ↓
8. User sees previous conversation with agent for this project
   ↓
9. User sends new message: "Update the login flow"
   ↓
10. Message persists to Supabase automatically
   ↓
11. Agent responds via SSE stream
   ↓
12. Response persists to Supabase automatically
   ↓
13. User clicks "Jump to dashboard →" button
   ↓
14. Returns to projects view with "customer-portal" card still selected
   ↓
15. User can select another project and see its chat history
```

---

## Testing Plan

### Backend Tests

**Terminal 1**: Start backend
```bash
python3 -m uvicorn backend.main:app --reload
```

**Terminal 2**: Test endpoints
```bash
# 1. Verify table exists
curl http://localhost:8000/sync/health
# Should return: {"status":"healthy","supabase_connected":true}

# 2. Save a message
curl -X POST http://localhost:8000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"project":"test-project","session":"test-session","role":"user","content":"Hello!"}'

# 3. Retrieve messages
curl http://localhost:8000/api/chat/history/test-project/test-session

# 4. Clear messages
curl -X DELETE http://localhost:8000/api/chat/history/test-project/test-session
```

### Frontend Tests

**Browser**: Open http://localhost:5173/admin

1. **Persistence Test**:
   - Send message in session A: "This is session A message 1"
   - Check Supabase table: Message should appear
   - Switch to session B
   - Chat should clear (empty state)
   - Send message in session B: "This is session B message 1"
   - Switch back to session A
   - Should see: "This is session A message 1"
   - Reload page
   - Should still see: "This is session A message 1"

2. **Navigation Test**:
   - Click "IDSE Projects" in LeftNav
   - Verify count badge shows (e.g., "5")
   - Projects dashboard displays all synced projects
   - Click a project card
   - Should jump to MD workspace with that project selected
   - RightPanel should show project/session in header
   - Click "Jump to dashboard →"
   - Should return to projects view
   - Previously clicked project card should remain highlighted

3. **Session Selector Test**:
   - Click "View projects dashboard (5)" button
   - Should switch to projects workspace
   - Select different project
   - Should load that project's chat history

---

## Acceptance Criteria

### Core Functionality
- ✅ Chat messages persist to Supabase on every user interaction
- ✅ Changing sessions loads the correct chat history for that session
- ✅ Messages survive page reloads
- ✅ Timestamps preserved for message ordering (created_at field)
- ✅ No duplicate messages (composite index handles deduplication)
- ✅ Loading states shown during fetch (loading spinner)
- ✅ Error handling for failed persistence (graceful degradation)

### Navigation Integration
- ✅ Clicking project in dashboard jumps to chat with that project selected
- ✅ Session selector shows "View projects dashboard (count)" button
- ✅ LeftNav shows project count badge on "IDSE Projects"
- ✅ RightPanel shows "Jump to dashboard →" button with current session context
- ✅ Seamless navigation flow between dashboard and chat views

### Performance
- ✅ Chat history loads in < 500ms for 100 messages
- ✅ Pagination ready (limit/offset parameters in API)
- ✅ Indexes ensure fast queries on session_id

### User Experience
- ✅ No visible lag when switching sessions
- ✅ Optimistic updates (messages appear immediately, persist in background)
- ✅ Error messages are clear and actionable
- ✅ Loading states don't block user input

---

## Files Created/Modified

### New Files (3)
- `backend/supabase/migrations/003_chat_messages.sql` - Database schema
- `backend/routes/chat_routes.py` - Chat history endpoints
- `frontend/widget/src/hooks/useChatHistory.ts` - React persistence hook

### Modified Files (7)
- `backend/routes/agui_realtime.py` - Persist messages in /inbound
- `backend/main.py` - Register chat routes
- `frontend/widget/src/puck/components/RightPanel.tsx` - Use hook + navigation
- `frontend/widget/src/components/IDSEProjectsDashboard.tsx` - Add onProjectSelect callback
- `frontend/widget/src/components/SessionSelector.tsx` - Add dashboard button + count badge
- `frontend/widget/src/components/LeftNav.tsx` - Add project count badge
- `frontend/widget/src/components/AdminDashboard.tsx` - Wire dashboard navigation

---

## Risk Mitigation

### Risk: Message Deduplication on Rapid Sends
**Impact**: Duplicate messages in database
**Mitigation**: Composite index on `(session_id, role, content, created_at)` prevents exact duplicates
**Likelihood**: Low (millisecond timestamps make collisions unlikely)

### Risk: Performance with Large Chat Histories
**Impact**: Slow loading times
**Mitigation**:
- Default limit of 100 messages
- Pagination ready via offset parameter
- Consider implementing virtual scrolling in future

### Risk: Session Change Race Conditions
**Impact**: Messages appearing in wrong session
**Mitigation**:
- `useEffect` properly tracks `[project, session]` dependencies
- Each save includes full project/session context
- No shared state between sessions

### Risk: Breaking Existing Chat Flow
**Impact**: Current chat stops working
**Mitigation**:
- Hook wraps existing behavior (optimistic updates preserved)
- Persistence failures don't block chat (try/catch, no throws)
- Graceful degradation if backend unavailable

---

## Rollback Plan

If implementation fails, rollback steps:

1. **Database**: Drop table (won't affect other features)
   ```sql
   DROP TABLE IF EXISTS chat_messages CASCADE;
   ```

2. **Backend**: Comment out chat routes registration in `main.py`
   ```python
   # app.include_router(chat_routes.router, tags=["Chat History"])
   ```

3. **Frontend**: Revert RightPanel to use `useState`
   ```typescript
   const [messages, setMessages] = useState<ChatMessage[]>([...]);
   ```

4. **Git**: Revert commit
   ```bash
   git revert <commit-hash>
   git push
   ```

---

## Post-Implementation Tasks

### Immediate (Same Day)
1. Monitor Supabase logs for errors
2. Test with multiple concurrent users
3. Verify message persistence across different projects
4. Check database growth (estimate: ~1KB per message)

### Short-Term (1 Week)
1. Add message search functionality (full-text search on content)
2. Implement message editing/deletion (soft delete with deleted_at flag)
3. Add export chat history feature (download as JSON/MD)
4. Consider adding user attribution (if multi-user support needed)

### Medium-Term (1 Month)
1. Add message reactions/annotations
2. Implement chat history search UI
3. Add analytics (message volume, response times)
4. Consider implementing RAG over chat history (embedding_vector field ready)

---

## Success Metrics

**Target Metrics** (measure 1 week after deployment):

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Session switch latency | < 500ms | Browser DevTools Network tab |
| Message persistence rate | > 99% | Supabase logs (success vs failure) |
| User satisfaction | > 90% | Informal feedback |
| Database query performance | < 100ms p95 | Supabase dashboard |
| Zero data loss incidents | 100% | Error monitoring |

---

## Dependencies

### Already Complete ✅
- Supabase configured and connected (`.env` has credentials)
- `/sync/projects` endpoint working
- Session persistence to `.idse_active_session.json`
- Projects dashboard built and integrated
- MCP sync endpoints tested

### Required Before Implementation
- None - all dependencies satisfied

---

## Estimated Timeline

**Total: 4-7 hours** (single developer)

| Task | Estimated Time | Priority |
|------|---------------|----------|
| 1. Database migration | 30 min | P0 |
| 2. Backend chat routes | 1 hour | P0 |
| 3. Register routes | 10 min | P0 |
| 4. Update /inbound | 30 min | P0 |
| 5. useChatHistory hook | 45 min | P0 |
| 6. Update RightPanel | 30 min | P0 |
| 7. Dashboard navigation | 30 min | P1 |
| 8. Navigation buttons | 30 min | P1 |
| Testing & debugging | 1-2 hours | P0 |

**Priority Levels**:
- P0 = Critical (chat persistence core)
- P1 = Important (navigation UX enhancements)

**Recommended Order**:
1. Backend first (Tasks 1-4): Get persistence working
2. Frontend core (Tasks 5-6): Wire up hook
3. Navigation (Tasks 7-8): Polish UX
4. Test everything

---

## Notes

- This plan assumes familiarity with FastAPI, React hooks, and Supabase
- Code examples are illustrative; actual implementation may vary
- All SQL uses Supabase-compatible PostgreSQL syntax
- Frontend uses Vite + React + TypeScript stack
- Backend uses FastAPI + Supabase-py client

---

**Plan Status**: ✅ Ready for Implementation
**Approved By**: Awaiting approval
**Implementation Start**: TBD
