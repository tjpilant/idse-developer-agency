# IDSE Orchestrator Migration Strategy
**From Prototype to Production**

## The Genesis Paradox

The IDSE Orchestrator was built **using the prototype system it's designed to replace**. This document outlines how we transition from the manual prototype to the automated production system.

---

## Current Architecture (Prototype)

### Prototype Components - Being Replaced

```
.cursor/tasks/
├── governance.py           ← Manual handoff tracking (Claude ↔ Codex)
└── session_manager.py      ← Manual session creation

idse-governance/
├── state/state.json        ← Manual state tracking
├── templates/handoff_templates/
├── feedback/               ← Manual handoff documents
└── protocols/              ← Manual handoff procedures
```

**Characteristics**:
- Human manually decides all handoffs
- Manual state updates via CLI commands
- Handoff summaries written by agents, acknowledged manually
- Session creation via Python script invocation
- No automated sync to central backend

---

## Target Architecture (Production)

### Production Components - What We Built

```
idse-orchestrator/          ← Pip-installable package
├── src/idse_orchestrator/
│   ├── cli.py              ← Commands: init, validate, sync, status
│   ├── project_manager.py  ← Article X compliant session creation
│   ├── template_loader.py  ← Multi-path template resolution
│   ├── state_tracker.py    ← Automated session_state.json management
│   ├── validator.py        ← Constitutional compliance checking
│   ├── mcp_client.py       ← MCP protocol for Agency sync (stub)
│   ├── agent_router.py     ← Agent assignment via registry (stub)
│   └── logger.py           ← Centralized logging
└── setup.py                ← Pip packaging

Agency Core Backend (Not Yet Built)
├── backend/supabase_client.py      ← Supabase integration
├── backend/routes/mcp_routes.py    ← MCP server endpoints
└── supabase/schema.sql             ← Multi-tenant database
```

**Characteristics**:
- Single `idse init` command creates full structure
- Automated validation against IDSE Constitution
- MCP sync to Supabase (when built)
- Agent routing via `agent_registry.json`
- Pip-installable in any client workspace

---

## Migration Phases

### ✅ Phase 0: Foundation (COMPLETE)
**Status**: Built and tested `idse-orchestrator` package

**Delivered**:
- Complete pip package with CLI
- Article X compliant directory creation
- Multi-path template resolution
- Constitutional validator
- State tracking infrastructure
- Agent router stub
- MCP client stub

**Testing**:
```bash
source .venv-orchestrator/bin/activate
idse init test-project
idse validate
# ✅ All tests passed
```

---

### 🔄 Phase 1: Supabase Backend (NEXT)
**Objective**: Build central Agency Core database and sync infrastructure

**Tasks**:

#### 1.1 Database Schema
Create `backend/supabase/schema.sql`:
```sql
-- Multi-tenant schema with RLS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  stack TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  session_name TEXT NOT NULL,
  intent_md TEXT,
  context_md TEXT,
  spec_md TEXT,
  plan_md TEXT,
  tasks_md TEXT,
  implementation_md TEXT,
  feedback_md TEXT,
  state_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  direction TEXT CHECK (direction IN ('push', 'pull')),
  timestamp TIMESTAMPTZ DEFAULT now(),
  artifacts_synced TEXT[]
);

-- Row-Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_isolation ON projects
  USING (client_id = current_setting('app.current_client_id')::uuid);
```

#### 1.2 Supabase Client
Create `backend/services/supabase_client.py`:
- Initialize Supabase client with service role key
- CRUD operations for projects, sessions
- JWT token generation for client authentication
- RLS context setting

#### 1.3 Backend Routes
Create `backend/routes/supabase_routes.py`:
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects (with RLS)
- `GET /api/projects/:id/sessions` - Get sessions
- `POST /api/sessions` - Create session

#### 1.4 Testing
- Unit tests for supabase_client.py
- Integration tests with test Supabase instance
- RLS policy verification

**Acceptance Criteria**:
- ✅ Schema deployed to Supabase
- ✅ Backend can create/read projects with RLS
- ✅ JWT authentication working
- ✅ All tests passing

---

### 🔄 Phase 2: MCP Gateway (AFTER PHASE 1)
**Objective**: Enable orchestrator ↔ Agency Core sync

**Tasks**:

#### 2.1 MCP Server Endpoints
Create `backend/routes/mcp_routes.py`:
```python
@router.post("/mcp/sync/push")
async def push_project(
    project_name: str,
    artifacts: Dict[str, str],  # stage -> content
    jwt_token: str
):
    # 1. Validate JWT
    # 2. Get client_id from token
    # 3. Update or insert session in Supabase
    # 4. Log sync_event
    # 5. Return success + timestamp
```

```python
@router.get("/mcp/sync/pull")
async def pull_project(
    project_name: str,
    jwt_token: str
):
    # 1. Validate JWT
    # 2. Get client_id from token
    # 3. Fetch latest session from Supabase
    # 4. Return artifacts
```

#### 2.2 Update Orchestrator MCP Client
Complete `idse-orchestrator/src/idse_orchestrator/mcp_client.py`:
- Replace stub authentication with real JWT requests
- Implement push_project() to POST artifacts
- Implement pull_project() to GET and apply artifacts
- Add retry logic and offline handling

#### 2.3 Testing
- Mock MCP server for unit tests
- End-to-end push/pull with real backend
- Network failure scenarios (offline-first design)

**Acceptance Criteria**:
- ✅ `idse sync push` uploads all artifacts to Supabase
- ✅ `idse sync pull` downloads and applies updates
- ✅ Offline mode works (queues syncs)
- ✅ All tests passing

---

### 🔄 Phase 3: Session Migration
**Objective**: Migrate existing sessions from prototype to orchestrator

**Tasks**:

#### 3.1 Migration Script
Create `scripts/migrate_prototype_sessions.py`:
```python
# Read existing sessions from projects/*/sessions/*
# For each session:
#   1. Create .idse/projects/*/sessions/* structure
#   2. Copy artifacts (intent.md, context.md, etc.)
#   3. Generate session_state.json from existing state
#   4. Update CURRENT_SESSION pointer
#   5. Log migration in idse-governance/feedback/
```

#### 3.2 Verify Migration
- Run `idse validate` on all migrated sessions
- Check session_state.json accuracy
- Verify CURRENT_SESSION pointers

#### 3.3 Archive Prototype
- Move `.cursor/tasks/` to `.cursor/tasks.deprecated/`
- Move `idse-governance/` to `idse-governance.prototype/`
- Add README explaining deprecation

**Acceptance Criteria**:
- ✅ All existing sessions migrated successfully
- ✅ All validations pass
- ✅ Prototype archived with migration notices

---

### 🔄 Phase 4: Documentation Update
**Objective**: Update governance docs to reference new system

**Tasks**:

#### 4.1 Update CLAUDE.md
Replace references to prototype:
```diff
- idse-governance/ directory contains IDE-level coordination
- .cursor/tasks/governance.py and session_manager.py
+ IDSE Orchestrator (pip package) handles session management
+ Install: pip install -e idse-orchestrator/
+ Commands: idse init, idse validate, idse sync
```

#### 4.2 Create Migration Guide
Create `docs/MIGRATION_GUIDE.md`:
- For users of the prototype
- Step-by-step migration instructions
- Comparison table (old vs. new commands)

#### 4.3 Update Agent Instructions
Update agent instructions to use new workflow:
- "Run `idse init <project>`" instead of "Run session_manager.py"
- "Run `idse validate`" instead of manual validation
- "Run `idse sync push`" instead of manual state updates

**Acceptance Criteria**:
- ✅ CLAUDE.md updated
- ✅ Migration guide complete
- ✅ Agent instructions reflect new system

---

### 🔄 Phase 5: Agent Router Integration
**Objective**: Complete agent routing and handoff automation

**Tasks**:

#### 5.1 Formalize Agent Registry
Update `agent_registry.json` schema:
```json
{
  "agents": [
    {
      "id": "claude-code",
      "role": "Planning and Documentation",
      "stages": ["intent", "context", "spec", "plan", "tasks", "feedback"],
      "capabilities": ["requirements analysis", "architecture design"],
      "handoff_protocol": "manual"  // or "automatic"
    },
    {
      "id": "gpt-codex",
      "role": "Implementation",
      "stages": ["implementation"],
      "capabilities": ["code generation", "debugging"],
      "handoff_protocol": "manual"
    }
  ],
  "handoff_rules": [
    {
      "from_stage": "tasks",
      "to_stage": "implementation",
      "from_agent": "claude-code",
      "to_agent": "gpt-codex",
      "requires_approval": true
    }
  ]
}
```

#### 5.2 Complete agent_router.py
- Read agent_registry.json
- `get_agent_for_stage()` implementation
- `suggest_handoff()` based on current stage
- Logging to `.idse/logs/agent_routing.log`

#### 5.3 Handoff Commands (Optional)
If user wants automation:
```bash
idse handoff --from claude-code --to gpt-codex --stage implementation
```

**Acceptance Criteria**:
- ✅ agent_registry.json formalized
- ✅ Agent router functional
- ✅ Handoff suggestions work

---

## Migration Decision Points

### Decision 1: Keep Manual Handoffs?
**Question**: Should we preserve the manual handoff workflow or automate?

**Options**:
- **A) Keep Manual** (Your current preference)
  - Human still decides when to handoff
  - Orchestrator provides structure, not automation
  - `agent_registry.json` is advisory only

- **B) Hybrid**
  - Orchestrator suggests handoffs
  - Human approves/rejects
  - Automatic state tracking

- **C) Fully Automated**
  - Stage completion triggers handoff
  - Agents auto-acknowledge
  - Human monitors only

**Recommendation**: Start with **A) Keep Manual** since that's your proven workflow.

---

### Decision 2: Deprecate Prototype Immediately or Grace Period?
**Question**: When to remove prototype scripts?

**Options**:
- **Immediate**: Delete after Phase 3 migration complete
- **Grace Period**: Keep for 1 month, add deprecation warnings
- **Permanent Archive**: Move to `archive/` for reference

**Recommendation**: **Permanent Archive** - useful as reference for understanding genesis.

---

### Decision 3: Supabase vs. File-Based Sync?
**Question**: Do we need Supabase for MVP or can we defer?

**Options**:
- **Supabase First**: Build Phases 1-2 before using orchestrator in production
- **File-Based MVP**: Use orchestrator with local-only state, add Supabase later
- **Hybrid**: Local-first with optional Supabase sync

**Recommendation**: **File-Based MVP** - orchestrator is usable now, Supabase adds multi-client capability later.

---

## Rollout Strategy

### Week 1: Supabase Backend (Phase 1)
- Day 1-2: Schema design and deployment
- Day 3-4: supabase_client.py implementation
- Day 5: Testing and validation

### Week 2: MCP Gateway (Phase 2)
- Day 1-2: MCP server endpoints
- Day 3-4: Orchestrator MCP client completion
- Day 5: Integration testing

### Week 3: Migration (Phase 3)
- Day 1-2: Migration script development
- Day 3: Execute migration on existing sessions
- Day 4: Validation and verification
- Day 5: Archive prototype

### Week 4: Documentation (Phase 4)
- Day 1-2: Update CLAUDE.md and governance docs
- Day 3-4: Create migration guide
- Day 5: Update agent instructions

### Week 5: Polish (Phase 5)
- Day 1-3: Agent router completion
- Day 4-5: Testing and bug fixes

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Migration Success Rate | 100% | All existing sessions validate post-migration |
| Orchestrator Adoption | 100% | All new sessions use `idse init` |
| Validation Pass Rate | ≥95% | `idse validate` across all sessions |
| Sync Reliability | ≥99% | MCP push/pull success rate |
| Documentation Coverage | 100% | All commands documented |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data loss during migration** | High | Backup all sessions before migration, test script on sample first |
| **Breaking existing workflows** | High | Grace period with both systems, clear migration guide |
| **Supabase complexity** | Medium | Start with file-based MVP, add Supabase incrementally |
| **Agent confusion** | Medium | Clear documentation, update instructions proactively |
| **Prototype dependencies** | Low | Audit all references before deprecation |

---

## Completion Criteria

The migration is **complete** when:

✅ All existing sessions migrated and validated
✅ Supabase backend operational with RLS
✅ MCP sync working end-to-end
✅ CLAUDE.md and agent instructions updated
✅ Prototype archived with migration notices
✅ All new sessions use `idse init` command
✅ Zero references to deprecated prototype in active code

---

## Next Immediate Steps

Based on current state (Phase 0 complete), the **immediate next action** is:

**Start Phase 1: Supabase Backend**

1. Create Supabase project (if not exists)
2. Design and deploy schema
3. Implement `backend/services/supabase_client.py`
4. Build initial API routes
5. Test with orchestrator

**Estimated effort**: 2-3 days

---

*Last updated: 2026-01-10*
*Author: Claude Code (genesis agent)*
*Authority: IDSE Constitution Article X*
