**spec.md — IDSE Developer Agency**

# Conceptual Definition

The Design Sandbox is an Agency-owned, isolated workspace for creating, testing, and documenting visual and interactive assets (e.g., React components, JS utilities, UI flows).
It is separate from any client’s production repository,
but integrated within the Agency’s overall IDSE system.

✅ Clarification Guidelines
Rule Meaning

1. Isolated from client codebase Sandbox components are not committed to or deployed with the client’s repository.
2. Integrated with Agency pipeline The sandbox is part of the Agency’s system; its outputs (e.g., JSX snippets, design tokens, style guides) can be referenced, imported, or linked in IDSE artifacts such as plan.md and spec.md.
3. Export, don’t embed Sandbox outputs are exported via file link, package reference, or documented snippet; they are consumed by the client project, not developed inside it.
4. Versioned under Agency control Sandbox code lives in the Agency’s own repository (e.g., /agency/design-sandbox/) and is versioned separately.
5. Shared through linkage When an IDE agent implements UI tasks, it receives references to sandbox assets in plan.md, not raw copies.

How AI Agents Should Interpret It

When AI agents encounter references like:

# From plan.md

See Design Sandbox component:
[Button Component v2.1](../../design-sandbox/components/Button.jsx)

They should interpret it as:

✅ “This is an Agency-maintained reference file that I can use or adapt when building client code.”

🚫 “This is not part of the client’s source tree; do not copy or deploy directly.”

## 1 · Purpose

Define the functional and operational specifications for the **IDSE Developer Agency**,
a meta-level orchestration system that manages, monitors, and evolves software projects built using the **Intent-Driven Systems Engineering (IDSE)** methodology.

The Agency ensures:

* Every project begins with a clear, validated intent.

* Each stage of the pipeline is generated, executed, and archived correctly.

* All activity (human or AI) remains aligned with the IDSE Constitution.

***

## 2 · System Overview

The **IDSE Developer Agency** is composed of three interacting subsystems:

| Subsystem        | Description                                                                       |
| :--------------- | :-------------------------------------------------------------------------------- |
| **Agency Core**  | Manages project lifecycle, orchestrator assignment, and Supabase synchronization. |
| **IDE Layer**    | Hosts local Orchestrator agents running inside IDEs (Cursor, VS Code).            |
| **Design Layer** | External JS/React sandbox for UI/UX prototyping and component generation.         |

Each subsystem communicates via **MCP (Machine-to-Cloud Protocol)** and stores canonical records in **Supabase**.

***

## 3 · Functional Requirements

| ID      | Function               | Description                                                                      | Output / Artifact                             |
| :------ | :--------------------- | :------------------------------------------------------------------------------- | :-------------------------------------------- |
| **F1**  | Project Initialization | Create a new project pipeline (Intent → Tasks) via Orchestrator.                 | `/projects/<name>/` workspace, manifest entry |
| **F2**  | Template Management    | Load and version IDSE templates from `kb/templates/`.                            | Valid Markdown artifacts                      |
| **F3**  | Agent Coordination     | Assign sub-agents (Claude, Codex, etc.) to stages based on registry.             | `agent_registry.json`                         |
| **F4**  | Design Integration     | Import or link external design artifacts (JS pages, React comps).                | Linked entries in `plan.md`                   |
| **F5**  | Validation             | Enforce compliance with the IDSE Constitution (no skipped stages).               | CI log, validator output                      |
| **F6**  | Supabase Sync          | Push/pull pipeline docs via MCP; store snapshots in cloud.                       | Updated Supabase row                          |
| **F7**  | Feedback Incorporation | Merge agent feedback into context/specs iteratively.                             | Updated `feedback.md`                         |
| **F8**  | Archival               | Finalize and archive completed projects, revoke agent access.                    | `archived=true` in Supabase                   |
| **F9**  | Analytics              | Track metrics: validation pass rate, feedback resolution time, agent efficiency. | Aggregated analytics table                    |
| **F10** | Access Control         | Manage agent and human credentials for each project.                             | Token policy + audit log                      |

***

## 4 · Non-Functional Requirements

| Category          | Specification                                                            |
| :---------------- | :----------------------------------------------------------------------- |
| **Security**      | All Supabase access via temporary MCP tokens; no persistent credentials. |
| **Reliability**   | All local commands recover from network failure with retry logic.        |
| **Performance**   | Local operations complete <5s; sync <3s for standard pipelines.          |
| **Usability**     | CLI and IDE integration intuitive; commands mirror natural workflow.     |
| **Auditability**  | Every project sync and archive timestamped and checksum-verified.        |
| **Extensibility** | New agent or design modules plug in via `adapters/` directory.           |

***

## 5 · System Inputs and Outputs

| Input              | Source               | Output                      | Destination              |
| :----------------- | :------------------- | :-------------------------- | :----------------------- |
| Project intent     | Human or Agency lead | `intent.md`                 | `/projects/`             |
| Design prototypes  | JS/React sandbox     | `plan.md` + component links | Orchestrator / IDE       |
| AI implementation  | IDE agents           | Code, tests, `feedback.md`  | `/src`, Supabase archive |
| Validation results | CI workflow          | `state_json` update         | Supabase                 |
| Sync event         | CLI or IDE           | Serialized project payload  | Supabase API             |

***

## 6 · Process Flow

### Standard Project Lifecycle

1. **Agency creates project intent**

   * Input: Name, purpose, stack, constraints.

   * Output: Local `/projects/<name>/intent.md`

2. **Orchestrator generates pipeline**

   * Output: `context.md`, `spec.md`, `plan.md`, `tasks.md`

   * Updates `idse-project.json` and manifest.

3. **Design team contributes external prototypes**

   * Output: Design links or imported assets in `plan.md`.

4. **IDE agents implement tasks**

   * Output: Code in repo, `feedback.md`.

5. **Validator enforces compliance**

   * Output: Validation results logged locally and in Supabase.

6. **Supabase sync (manual)**

   * Push pipeline docs and state snapshot.

7. **Project archive**

   * Update Supabase row → `"archived": true`

   * Remove IDE agent tokens.

***

## 7 · Integration Interfaces

| Interface         | Protocol                     | Description                                      |
| :---------------- | :--------------------------- | :----------------------------------------------- |
| **MCP Push/Pull** | HTTPS (JSON payload)         | Manual sync from local Orchestrator to Supabase. |
| **CLI Interface** | Local shell or IDE command   | Exposes `init`, `validate`, `sync`, `archive`.   |
| **IDE API**       | VS Code Extension API        | Provides buttons and status bar updates.         |
| **Design Import** | File watch + JSON descriptor | Pulls approved components into plan.md.          |

***

## 8 · Data Models

### `supabase.projects`

```sql
create table projects (
  id uuid primary key,
  name text,
  stack text,
  intent_md text,
  context_md text,
  spec_md text,
  plan_md text,
  tasks_md text,
  feedback_md text,
  state_json jsonb,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `session_state.json` (local)

```json
{
  "project_name": "customer-portal",
  "stages": {
    "intent": "complete",
    "context": "complete",
    "spec": "in_progress",
    "plan": "draft",
    "tasks": "pending",
    "implementation": "pending",
    "feedback": "pending"
  },
  "last_sync": "2026-01-08T23:40:00Z"
}
```

***

## 9 · Acceptance Criteria

| Criterion                  | Metric / Condition                                         |
| :------------------------- | :--------------------------------------------------------- |
| **Project initialization** | Running `idse init` creates valid pipeline docs.           |
| **Validation compliance**  | `idse validate` passes with no `[REQUIRES INPUT]`.         |
| **Manual sync integrity**  | `idse sync push` → Supabase row updated and confirmed.     |
| **Feedback incorporation** | Feedback merged upstream without data loss.                |
| **Archive success**        | Project flagged archived; tokens revoked; logs written.    |
| **Orchestrator autonomy**  | System operates fully offline except during explicit sync. |

***

## 10 · Dependencies

| Type           | Dependency                 | Purpose                              |
| :------------- | :------------------------- | :----------------------------------- |
| **Software**   | Python 3.12, Node.js 20+   | Runtime for CLI + design prototyping |
| **Database**   | Supabase                   | Persistent pipeline archive          |
| **Protocol**   | MCP                        | Secure sync transport                |
| **Agents**     | Claude Code, ChatGPT Codex | Implementation execution             |
| **CI Tooling** | GitHub Actions             | Validation enforcement               |

***

## 11 · Risks and Mitigation

| Risk                          | Mitigation                                       |
| :---------------------------- | :----------------------------------------------- |
| **Sync conflicts**            | Timestamped diffs and pre-push validation.       |
| **Data loss during archive**  | Supabase transaction + backup trigger.           |
| **Unauthorized agent access** | Token expiration + revocation after archive.     |
| **Template drift**            | Template version control + manifest enforcement. |
| **Spec/code divergence**      | Feedback validation + CI check enforcement.      |

***

## 12 · Open Questions → \[REQUIRES INPUT]

1. Should the Agency maintain **multi-tenant project isolation** (separate Supabase schemas per client)?
2. Should MCP connections support **asymmetric sync** (push-only or pull-only roles)?
3. Should the analytics dashboard aggregate across **active + archived** projects?
4. Should the Agency have automated **intent → proposal generation** capability for client onboarding?

***

✅ **This Specification defines**:

* The exact behavior and deliverables of the IDSE Developer Agency system.

* Its interfaces, constraints, and measurable success criteria.

* Its adherence to the IDSE Constitution and Orchestrator-driven workflow.

***

Would you like me to continue with the **`plan.md`** next — outlining the concrete architecture (modules, data flow, phases, and testing strategy) for implementing the *Agency platform itself*?
