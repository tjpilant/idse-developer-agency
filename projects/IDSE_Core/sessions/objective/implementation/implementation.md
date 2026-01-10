Implementation -IDSE Developer Agency

## 1 · System Overview

The **IDSE Developer Agency** is a **meta-engineering platform** that coordinates multiple IDSE Orchestrator agents, IDE environments, and Supabase project records — all without interfering with production codebases.

The Agency is built around four main services:

1. **Agency Core (CLI + API)**
2. **Local IDE Orchestrators**
3. **MCP Gateway**
4. **Design Sandbox (JS/React)**

These services interconnect through the MCP protocol and share project metadata in Supabase.

***

## 2 · Repository & Folder Structure

```
These services interconnect through the MCP protocol and share project metadata in Supabase.idse-developer-agency/
├── agency_core/                     # Main orchestrator + CLI + API
│   ├── __init__.py
│   ├── cli.py                       # CLI interface
│   ├── core.py                      # Project manager, assignment logic
│   ├── validator.py                 # Manifest + Constitution validation
│   ├── supabase_client.py           # API abstraction
│   ├── mcp_client.py                # Handles push/pull sync
│   ├── auth.py                      # Token management + RLS
│   ├── analytics.py                 # Metrics aggregation
│   ├── dashboard.py                 # CLI or web dashboard generator
│   └── logger.py                    # Event logging + file rotation
│
├── idse_orchestrator/               # Local orchestrator agent (runs in IDE)
│   ├── cli_orchestrator.py
│   ├── template_loader.py
│   ├── state_tracker.py
│   ├── feedback_merger.py
│   ├── agent_router.py
│   └── session_state.json
│
├── mcp_gateway/                     # Sync server (FastAPI or Express)
│   ├── main.py
│   ├── routes/
│   │   ├── push.py
│   │   ├── pull.py
│   │   └── auth.py
│   ├── schemas.py
│   └── tests/
│       └── test_mcp.py
│
├── design_sandbox/                  # JS/React prototyping workspace
│   ├── components/
│   ├── design.json                  # Export format for linkage
│   ├── README.md
│   └── package.json
│
├── scripts/
│   ├── validate_manifest.py
│   ├── aggregate_metrics.py
│   ├── init_supabase_schema.sql
│   └── archive.sql
│
├── tests/
│   ├── test_cli.py
│   ├── test_sync.py
│   ├── test_validator.py
│   ├── test_orchestrator.py
│   ├── test_archive.py
│   ├── test_dashboard.py
│   └── test_e2e.py
│
├── config/
│   ├── .idseconfig.json             # Local config template
│   ├── agent_registry.json          # Stage ownership per agent
│   └── supabase.env
│
├── web_dashboard/                   # Optional Next.js dashboard
│   ├── pages/
│   ├── components/
│   ├── api/
│   └── package.json
│
├── docs/
│   ├── README_IDSE.md
│   ├── knowledge_manifest.json
│   ├── templates/
│   └── examples/
│
├── .github/workflows/
│   └── validate-agency.yml
│
└── requirements.txt / package.json
```

***

## 3 · Module-Level Breakdown

### 🧭 **Agency Core**

* **Language:** Python 3.12
* **Purpose:** Acts as meta-orchestrator; manages Supabase sync, validation, and analytics.
* **Core Modules:**
  * `cli.py`: user commands (`init`, `list`, `sync`, `archive`, `report`)
  * `core.py`: manages project lifecycle + registry
  * `supabase_client.py`: CRUD wrapper for Supabase REST API
  * `validator.py`: enforces IDSE Constitution compliance
  * `analytics.py`: computes metrics from Supabase data
  * `logger.py`: writes structured logs for all operations

***

### 🧠 **Local IDE Orchestrator**

* **Language:** Python
* **Purpose:** Runs inside IDE (Cursor, VSCode) as local agent.
* **Functions:**
  * Generates IDSE pipeline files (`intent.md` → `feedback.md`)
  * Tracks stage completion via `session_state.json`
  * Validates artifacts locally
  * Performs MCP syncs on command

***

### 🌐 **MCP Gateway**

* **Language:** FastAPI (Python) or Express (Node.js)
* **Purpose:** Facilitates secure, stateless push/pull operations between IDE and Supabase.
* **Endpoints:**
  * `POST /mcp/push` → receives pipeline package
  * `GET /mcp/pull?project_id=` → returns current Supabase snapshot
  * `POST /auth/token` → generates temporary JWT

***

### 🎨 **Design Sandbox**

* **Language:** Node.js + React

* **Purpose:** Provide a safe, detached environment for prototyping UI and components.

* **Exports:**

  * `design.json`: describes each component (name, path, purpose, spec link)

  * Example:

    ```
    {
      "components": [
        { "name": "Navbar", "path": "components/Navbar.jsx", "linked_plan": "projects/portal/plan.md" }
      ]
    }
    ```

***

### 📊 **Analytics Layer**

* Aggregates key metrics:
  * Validation pass rates
  * Stage completion percentages
  * Feedback merge rates
  * Sync success/failure logs
* Provides outputs in JSON and Markdown dashboard form:
  * CLI: `agency report --format md`
  * Web: `/web_dashboard/`

***

## 4 · Dependency Graph

```
Agency Core
 ├── uses Supabase Client
 ├── calls MCP Gateway
 ├── reads Agent Registry
 ├── validates via Validator
 └── reports via Analytics
        ▲
        │
        │
 IDE Orchestrator
 ├── generates pipeline docs
 ├── validates locally
 └── syncs via MCP Client
        │
        ▼
 MCP Gateway
 └── writes/reads Supabase
```

***

## 5 · Implementation Strategy (Phased Rollout)

| Phase                        | Deliverables                                | Tools / Languages |
| :--------------------------- | :------------------------------------------ | :---------------- |
| **1. Core CLI + Schema**     | CLI skeleton, Supabase schema deployed      | Python + SQL      |
| **2. IDE Orchestrator**      | Local CLI commands, validator               | Python            |
| **3. MCP Gateway**           | REST sync service                           | FastAPI / Express |
| **4. Design Sandbox**        | JS/React prototype space                    | Node.js + React   |
| **5. Validation & CI**       | GitHub Actions workflow                     | Python + YAML     |
| **6. Analytics & Dashboard** | Metrics aggregator + optional web dashboard | Python / Next.js  |
| **7. Archive & Cleanup**     | Archive command, token revocation           | Python + SQL      |

***

## 6 · Testing Framework

* **Framework:** `pytest` (Python), `jest` (JS components)
* **CI Tool:** GitHub Actions (`validate-agency.yml`)
* **Test Categories:**
  * **Unit:** CLI commands, Supabase client, validator logic
  * **Integration:** MCP push/pull, feedback merge
  * **E2E:** Full pipeline from init → archive
  * **Performance:** Sync latency < 3s
  * **Security:** Token expiry + access control enforcement

***

## 7 · Configuration & Environment Setup

### `.idseconfig.json`

```
{
  "supabase_url": "https://yourproject.supabase.co",
  "supabase_key": "anon-key",
  "mcp_endpoint": "https://mcp.idse-agency.io",
  "mode": "offline",
  "default_project_path": "projects/"
}
```

### `.gitignore`

```
# Ignore IDSE workspaces
projects/
logs/
.session_state.json
```

### Environment Variables

```
SUPABASE_SERVICE_ROLE=
SUPABASE_ANON_KEY=
MCP_API_KEY=
AGENCY_ENV=production
```

***

## 8 · Validation Workflows

### Local

```
idse validate
```

→ Runs `validate_manifest.py`
→ Updates `session_state.json`
→ Fails on `[REQUIRES INPUT]`

### CI (GitHub)

```
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - run: python scripts/validate_manifest.py
```

***

## 9 · Archival & Cleanup Automation

### `agency archive`

1. Validates pipeline → ensures no pending tasks.
2. Pushes final snapshot to Supabase.
3. Executes `archive.sql` trigger to move row to `projects_history`.
4. Revokes IDE tokens and logs completion event.
5. Removes local `/projects/<name>/`.

***

## 10 · Integration Path with IDE Agents

### Claude Code / Codex

* Read `/projects/<name>/plan.md` and `/tasks.md`
* Implement tasks directly in code repo
* Write feedback into `/projects/<name>/feedback.md`
* Trigger `idse validate` locally before sync

### Agency Core

* Receives updates from Supabase
* Generates analytics + progress reports

***

## 11 · Example Command Flow

```
# 1. Initialize new project pipeline
agency init "telemetry-dashboard"

# 2. Generate pipeline docs
idse init "telemetry-dashboard"

# 3. Validate locally
idse validate

# 4. Sync to Agency archive
idse sync push
agency sync push "telemetry-dashboard"

# 5. Run analytics and report
agency report --format md

# 6. Archive when done
agency archive "telemetry-dashboard"
```

***

## 12 · Implementation Acceptance Criteria

✅ All services initialize and run locally without Supabase connection (offline-first).
✅ `agency init` → `idse init` → `idse sync push` sequence completes end-to-end.
✅ CI workflow validates all project docs automatically.
✅ Design sandbox can export and link prototypes.
✅ Archived projects are immutable and logged with checksum.

***

## 13 · Open Implementation Questions → \[REQUIRES INPUT]

1. Should the **dashboard** be rendered as a web UI (Next.js) or CLI-only Markdown reports?
2. Should IDE Orchestrator use **Python FastAPI** or **TypeScript CLI** for consistency with design layer?
3. Should the Agency Core eventually support **multi-tenant Supabase instances** per client?
4. Should archived pipelines be signed with a digital hash (for provenance / authenticity)?

