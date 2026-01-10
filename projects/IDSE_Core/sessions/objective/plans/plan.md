# Plan for Objective Session Pipeline

Design Sandbox (JS/React)

The Design Sandbox is an Agency-owned internal workspace, not part of any client’s production codebase.
It exists to prototype UI/UX elements, JS components, and visual flows.
Artifacts created here are referenced or exported into client projects via plan.md links or asset manifests.

Agents should treat the Sandbox as a trusted design library, not an external dependency to igno

## 1 · Architectural Overview

The **IDSE Developer Agency** is a **meta-orchestration platform** that manages multiple IDSE projects, orchestrators, and design pipelines.
It sits above the individual developer environments and ensures that all activity — human or AI — flows through validated, documented channels.

### System Layers

```
┌──────────────────────────────────────────────────────────────┐
│                      IDSE Developer Agency                    │
│──────────────────────────────────────────────────────────────│
│ 🧭 Agency Core Orchestrator  (CLI + API)                      │
│ 📂 Supabase Integration (Projects Table + History)            │
│ 🧠 IDE Orchestrator Agents (Local per project)                │
│ 🎨 Design Sandbox (JS/React for UI Prototyping)               │
│ 🧪 Validation + CI Layer (Constitutional Checks)               │
└──────────────────────────────────────────────────────────────┘
```

***

## 2 · Core Components

| Component              | Responsibility                        | Description                                                    |
| :--------------------- | :------------------------------------ | :------------------------------------------------------------- |
| **Agency Core**        | Central manager for all projects.     | Provides CLI + dashboard; assigns Orchestrators.               |
| **Orchestrator Agent** | Local pipeline manager (per project). | Generates, validates, and syncs pipeline docs.                 |
| **Supabase Service**   | Persistence and archival.             | Stores project pipeline docs, validation state, and analytics. |
| **MCP Gateway**        | Secure transport layer.               | Manages on-demand syncs between local IDEs and Supabase.       |
| **Design Sandbox**     | External prototyping environment.     | JS/React sandbox for UI assets; outputs linked specs.          |
| **Validation Layer**   | Enforces IDSE Constitution.           | Runs validator and CI workflows on demand.                     |
| **Analytics Layer**    | Observability and reporting.          | Aggregates data from Supabase; reports metrics.                |

***

## 3 · Module Design

### 🧭 Agency Core (Python / FastAPI or Node / Express)

* CLI commands: `agency init`, `agency list`, `agency sync`, `agency archive`
* REST endpoints:
  * `POST /projects` — create new project
  * `GET /projects` — list projects
  * `POST /sync/push` — receive pipeline from IDE
  * `GET /sync/pull` — provide pipeline snapshot
* Schedules validation checks
* Writes logs and maintains an internal manifest of all projects

***

### 🧠 IDE Orchestrator Agents

* One per active project; runs within VS Code / Cursor
* Commands:
  * `idse init` — generate pipeline docs
  * `idse validate` — run local validation
  * `idse sync push/pull` — communicate with Agency Core via MCP
* Stores session state locally (`session_state.json`)
* Invokes design prototypes and agent adapters

***

### 🎨 Design Sandbox (JS/React)

* Isolated from codebase; used by the Agency’s design team.
* Outputs:
  * Component specs
  * UI flow diagrams
  * Prototype documentation
* Linked into `plan.md` or `spec.md` via file reference or URL.

***

### 📂 Supabase Data Layer

* Schema:
  `projects`, `agents`, `history`, `analytics`
* All project pipeline artifacts stored as text columns.
* Uses row-level security and JWT auth via MCP.
* Each `sync push` event triggers an insert or update + backup.

***

### 🧪 Validation & CI

* Uses local Python validator (`validate_manifest.py`).
* Each project validated locally before push.
* Agency Core revalidates on arrival at Supabase.

***

### 📊 Analytics Layer

* Periodically aggregates project-level metrics:
  * Stage completion %
  * Validation success rate
  * Feedback incorporation time
* Generates dashboard summaries for internal reports.

***

## 4 · Data Flow

```
     ┌────────────┐        ┌───────────────────┐
     │   Agency    │◄──────►│   Supabase API    │
     │   Core CLI  │        │ (Projects Table)  │
     └────┬───────┘        └───────────────────┘
          │
          │ MCP Push/Pull
          │
┌─────────▼─────────┐
│  IDE Orchestrator │
│   (Cursor / VSCode)│
└─────────┬─────────┘
          │
   Local File System
          │
┌─────────▼─────────┐
│  Design Sandbox   │
│  (JS Components)  │
└───────────────────┘
```

***

## 5 · Data Models

### `supabase.projects`

| Field                       | Type      | Description        |
| :-------------------------- | :-------- | :----------------- |
| `id`                        | UUID      | Project ID         |
| `name`                      | TEXT      | Project name       |
| `stack`                     | TEXT      | Tech stack         |
| `intent_md` – `feedback_md` | TEXT      | Pipeline artifacts |
| `state_json`                | JSONB     | Pipeline status    |
| `archived`                  | BOOLEAN   | Finalization flag  |
| `created_at` / `updated_at` | TIMESTAMP | Audit timestamps   |

### `supabase.agents`

| Field        | Type      | Description          |
| :----------- | :-------- | :------------------- |
| `id`         | UUID      | Agent identifier     |
| `project_id` | UUID      | Associated project   |
| `role`       | TEXT      | Stage responsibility |
| `last_seen`  | TIMESTAMP | Recent activity      |

***

## 6 · Command Set

| Command                      | Function                                               | Outcome                         |
| :--------------------------- | :----------------------------------------------------- | :------------------------------ |
| `agency init <project>`      | Creates project entry in Supabase and local workspace. | `intent.md` + manifest created. |
| `agency assign <agent>`      | Assigns IDE or design agent to project stage.          | Updates `agent_registry.json`.  |
| `agency sync push <project>` | Uploads pipeline docs to Supabase.                     | Row updated, timestamp logged.  |
| `agency sync pull <project>` | Fetches pipeline updates from Supabase.                | Local files refreshed.          |
| `agency archive <project>`   | Marks project complete; disables tokens.               | `archived=true`                 |
| `agency report`              | Generates analytics dashboard.                         | Markdown or web dashboard.      |

***

## 7 · Test Strategy

| Level                 | Scope                                                | Example Tools              |
| :-------------------- | :--------------------------------------------------- | :------------------------- |
| **Unit Tests**        | Orchestrator CLI, MCP client, Validator              | `pytest`, `unittest`       |
| **Integration Tests** | End-to-end MCP push/pull with mock Supabase          | `requests_mock`            |
| **System Tests**      | Full pipeline across Orchestrator, IDE, and Supabase | GitHub Actions             |
| **Acceptance Tests**  | Human + AI collaboration validation                  | Manual / scripted          |
| **Performance Tests** | Sync throughput, validation latency                  | Locust or custom benchmark |
| **Security Tests**    | Token rotation, expired auth, RLS enforcement        | Postman / Pytest fixtures  |

***

## 8 · Implementation Phases

| Phase                             | Objective                                     | Deliverables                |
| :-------------------------------- | :-------------------------------------------- | :-------------------------- |
| **1. Core Setup**                 | Establish Supabase schema + CLI scaffolding   | CLI + Supabase tables       |
| **2. Orchestrator Agents**        | Build local agent + validate offline pipeline | Local CLI + validation      |
| **3. MCP Gateway**                | Implement secure sync protocol                | Push/pull working endpoint  |
| **4. Design Sandbox Integration** | Add external design linking                   | UI component import         |
| **5. Analytics & Dashboard**      | Aggregate metrics + visual reporting          | Dashboard + JSON export     |
| **6. Finalization**               | Archival, cleanup, and access revocation      | `archive` workflow complete |

***

## 9 · Metrics & Monitoring

| Metric                      | Source        | Target         |
| :-------------------------- | :------------ | :------------- |
| Project Initialization Time | CLI logs      | < 10 min       |
| Validation Pass Rate        | CI            | 100%           |
| Feedback Loop Latency       | Supabase logs | < 24 hrs       |
| Archived Projects           | Supabase      | 100% validated |
| Sync Failures               | MCP logs      | < 1% retries   |

***

## 10 · Risks and Mitigations

| Risk                         | Impact                 | Mitigation                         |
| :--------------------------- | :--------------------- | :--------------------------------- |
| **Network instability**      | Sync failures          | Offline-first design + retry logic |
| **Template drift**           | Inconsistent pipelines | Template versioning in manifest    |
| **Spec drift**               | Code/spec mismatch     | Feedback auto-merge validation     |
| **Unauthorized edits**       | Data corruption        | RLS policies + per-agent tokens    |
| **Design/code misalignment** | Visual discrepancies   | Mandatory plan.md linkage reviews  |

***

## 11 · Deliverable Summary

| Deliverable            | Description                                  |
| :--------------------- | :------------------------------------------- |
| `agency-cli`           | Main command-line tool for managing projects |
| `idse-orchestrator`    | Local project manager                        |
| `supabase-schema.sql`  | Database schema and migration scripts        |
| `mcp-server`           | Lightweight sync server (FastAPI or Express) |
| `design-sandbox`       | JS/React prototype workspace                 |
| `analytics-dashboard`  | Web/CLI dashboard for reporting              |
| `validate_manifest.py` | Constitutional validator for pipelines       |

***

## 12 · Completion Definition

The **IDSE Developer Agency** is considered *ready for deployment* when:

* All CLI + MCP functions operate reliably in offline mode.
* Supabase integration successfully stores and retrieves pipelines.
* Design Sandbox can link JS assets into plans.
* All active projects validate against the IDSE Constitution.
* Archival successfully removes IDE agent access and logs the event.

***

## 13 · Open Questions → \[REQUIRES INPUT]

1. Should analytics and dashboards be **CLI-based (Markdown)** or **web-based (Next.js)**?
2. Should MCP use **FastAPI (Python)** or **Express (Node)** for its gateway server?
3. Should archived pipelines be compressed and downloadable (ZIP/JSON)?
4. Should Agency Core manage billing/time tracking through Supabase or external service (e.g., Notion, Airtable)?

