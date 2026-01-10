# Tasks for Objective Session Pipeline

## Phase 1 — Core Setup: Foundations

| ID       | Description                                                                             | Deliverable                  | Dependencies | Parallel | Acceptance Criteria                                          |
| :------- | :-------------------------------------------------------------------------------------- | :--------------------------- | :----------- | :------- | :----------------------------------------------------------- |
| **T1.1** | Initialize Supabase schema (`projects`, `agents`, `history`, `analytics`)               | `supabase-schema.sql`        | —            | \[P]     | Schema deployed; tables accessible via API.                  |
| **T1.2** | Scaffold Agency Core CLI (`agency-cli`) with commands `init`, `list`, `sync`, `archive` | `src/cli.py` or `src/cli.ts` | —            | \[P]     | Running `agency --help` displays all core commands.          |
| **T1.3** | Define `.idseconfig.json` schema for local configuration                                | `.idseconfig.json`           | T1.2         | \[P]     | CLI reads Supabase + MCP settings correctly.                 |
| **T1.4** | Create `project_manifest.json` registry format                                          | `project_manifest.json`      | T1.2         | \[P]     | Manifest lists active projects and orchestrator assignments. |
| **T1.5** | Create logging module for CLI and sync operations                                       | `src/logger.py`              | T1.2         | \[P]     | Logs generated under `/logs/` with timestamps.               |
| **T1.6** | Unit tests for CLI commands and schema creation                                         | `tests/test_cli.py`          | T1.1–T1.5    | \[P]     | All tests pass with 90%+ coverage.                           |

***

## 🧠 Phase 2 — Orchestrator Agents (Local IDE Layer)

| ID       | Description                                                    | Deliverable                  | Dependencies | Parallel | Acceptance Criteria                                         |
| :------- | :------------------------------------------------------------- | :--------------------------- | :----------- | :------- | :---------------------------------------------------------- |
| **T2.1** | Scaffold local `idse-orchestrator` CLI for VS Code / Cursor    | `src/orchestrator.py`        | T1.2         | \[P]     | Running `idse init` generates `/projects/<name>/` pipeline. |
| **T2.2** | Implement local validation command (`idse validate`)           | `src/validator.py`           | T2.1         | \[P]     | Detects `[REQUIRES INPUT]` markers and missing artifacts.   |
| **T2.3** | Build `session_state.json` tracker for pipeline stage progress | `src/state_tracker.py`       | T2.1         | \[P]     | Updates automatically when pipeline docs change.            |
| **T2.4** | Integrate validation + state tracking into CLI workflow        | `src/cli_orchestrator.py`    | T2.2 + T2.3  | <br />   | `idse validate` updates session state.                      |
| **T2.5** | Unit + integration tests for orchestrator and validator        | `tests/test_orchestrator.py` | T2.1–T2.4    | \[P]     | Tests pass; validation errors caught correctly.             |

***

## 🌐 Phase 3 — MCP Gateway (Manual Sync Protocol)

| ID       | Description                                        | Deliverable              | Dependencies | Parallel | Acceptance Criteria                                           |
| :------- | :------------------------------------------------- | :----------------------- | :----------- | :------- | :------------------------------------------------------------ |
| **T3.1** | Build MCP client library for CLI + Orchestrator    | `src/mcp_client.py`      | T2.4         | \[P]     | `idse sync push/pull` executes successfully with mock server. |
| **T3.2** | Build MCP Gateway server (FastAPI or Express)      | `mcp-server/`            | T3.1         | \[P]     | Receives push/pull requests; responds with project JSON.      |
| **T3.3** | Implement authentication + token rotation          | `src/auth.py`            | T3.2         | \[P]     | Tokens expire after 30 mins; secure validation.               |
| **T3.4** | Integrate Supabase API client for data persistence | `src/supabase_client.py` | T1.1         | <br />   | Data pushes create or update project rows.                    |
| **T3.5** | End-to-end sync test with mock Supabase backend    | `tests/test_sync.py`     | T3.1–T3.4    | \[P]     | Push/pull cycles complete without conflict.                   |

***

## 🎨 Phase 4 — Design Sandbox Integration

| ID       | Description                                                 | Deliverable                  | Dependencies | Parallel | Acceptance Criteria                                  |
| :------- | :---------------------------------------------------------- | :--------------------------- | :----------- | :------- | :--------------------------------------------------- |
| **T4.1** | Create JS/React prototype environment for design team       | `design-sandbox/`            | —            | \[P]     | Designers can create React components independently. |
| **T4.2** | Define export format (`design.json`) for linking prototypes | `design-sandbox/design.json` | T4.1         | \[P]     | Exports contain metadata and component paths.        |
| **T4.3** | Add CLI command to import design references into `plan.md`  | `src/design_importer.py`     | T4.2         | <br />   | Plan.md updated with design links.                   |
| **T4.4** | Tests for design linking + plan validation                  | `tests/test_design.py`       | T4.3         | \[P]     | `plan.md` links validate without errors.             |

***

## 🧪 Phase 5 — Validation & CI Enforcement

| ID       | Description                                                | Deliverable                             | Dependencies | Parallel | Acceptance Criteria                                 |
| :------- | :--------------------------------------------------------- | :-------------------------------------- | :----------- | :------- | :-------------------------------------------------- |
| **T5.1** | Write `validate_manifest.py` for multi-project validation  | `scripts/validate_manifest.py`          | T2.2         | \[P]     | Detects unresolved inputs and missing dependencies. |
| **T5.2** | Implement GitHub Actions workflow for automated validation | `.github/workflows/validate-agency.yml` | T5.1         | \[P]     | CI fails on validation error; passes otherwise.     |
| **T5.3** | Add test coverage for constitutional rules                 | `tests/test_constitutional.py`          | T5.1         | \[P]     | CI enforces Article III, IV, VII checks.            |
| **T5.4** | Integrate validation summary into Supabase analytics       | `src/analytics.py`                      | T5.1         | <br />   | Validation results logged centrally.                |

***

## 📊 Phase 6 — Analytics & Dashboard

| ID       | Description                                           | Deliverable                            | Dependencies | Parallel | Acceptance Criteria                                  |
| :------- | :---------------------------------------------------- | :------------------------------------- | :----------- | :------- | :--------------------------------------------------- |
| **T6.1** | Create data aggregation script for project metrics    | `scripts/aggregate_metrics.py`         | T3.4         | \[P]     | Aggregates per-project validation and timing data.   |
| **T6.2** | Build dashboard generator (CLI Markdown / web option) | `src/dashboard.py` or `web/dashboard/` | T6.1         | \[P]     | Displays progress per project; optional HTML export. |
| **T6.3** | Add `agency report` command for summary generation    | CLI extension                          | T6.2         | <br />   | Outputs agency-level report.                         |
| **T6.4** | Tests for analytics data integrity                    | `tests/test_analytics.py`              | T6.1–T6.3    | \[P]     | Metrics accurate; no missing data.                   |

***

## 🏁 Phase 7 — Archival & Cleanup

| ID       | Description                                 | Deliverable                      | Dependencies | Parallel | Acceptance Criteria                          |
| :------- | :------------------------------------------ | :------------------------------- | :----------- | :------- | :------------------------------------------- |
| **T7.1** | Implement `agency archive` command          | CLI extension                    | T3.4         | \[P]     | Marks project archived and disables tokens.  |
| **T7.2** | Build Supabase archival backup trigger      | `supabase/functions/archive.sql` | T7.1         | <br />   | Snapshot stored in `projects_history`.       |
| **T7.3** | Implement automated token revocation system | `src/auth_revoke.py`             | T7.1         | \[P]     | Tokens expire immediately after archive.     |
| **T7.4** | End-to-end archive test                     | `tests/test_archive.py`          | T7.1–T7.3    | \[P]     | Archived project inaccessible to IDE agents. |

***

## 🔁 Cross-Phase Tasks

| ID       | Description                                                   | Deliverable           | Acceptance Criteria                                 |
| :------- | :------------------------------------------------------------ | :-------------------- | :-------------------------------------------------- |
| **TX.1** | Documentation updates (`README_IDSE.md`, templates, examples) | Updated docs          | Complete and linked to latest Orchestrator version. |
| **TX.2** | Agent registry definitions for Claude Code, Codex, etc.       | `agent_registry.json` | Registered roles validated by Orchestrator.         |
| **TX.3** | `.gitignore` and project isolation setup                      | `.gitignore`          | Ensures `/projects/` excluded from code repo.       |
| **TX.4** | End-to-end smoke test (Agency → Orchestrator → Supabase)      | `tests/test_e2e.py`   | Pipeline completes without errors.                  |

***

## ✅ Completion Definition

The **IDSE Developer Agency** is fully functional when:

1. `agency init` → `idse init` → `idse validate` → `agency sync push` runs end-to-end.
2. Supabase successfully stores pipelines, validation results, and feedback.
3. CI passes for all active projects.
4. Design Sandbox assets link correctly to plans.
5. Archived projects are immutable, with revoked tokens and clean logs.

***

## 🧠 Parallelization Guidance

* **Phase 1–2** can run in parallel (infra + local agent).
* **Phase 3** requires Phase 1 Supabase setup.
* **Phase 4–6** can proceed concurrently post-sync implementation.
* **Phase 7** runs only after all previous phases pass validation.

***

## 🚨 Open Task Questions → \[REQUIRES INPUT]

1. Should dashboard generation (T6.2) be CLI-only (Markdown) or include a web-based UI?
2. Should Supabase triggers send webhook notifications to Discord/Slack for sync events?
3. Should archived project ZIPs be downloadable via CLI (`agency export`)?
4. Should the Agency run multi-tenant Supabase schemas for different clients?

