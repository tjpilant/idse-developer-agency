<br />

## Context - IDSE Developer Agency

The session pipeline is to b1 · Environment Overview

The **IDSE Developer Agency** operates as a distributed, AI-assisted development environment combining:

* Human-led design and systems architecture, and

* AI agent–driven specification, planning, tasking, and implementation.

It runs within a **multi-layered ecosystem**:

| Layer                   | Description                                                                             |
| :---------------------- | :-------------------------------------------------------------------------------------- |
| **Agency Layer**        | Strategic planning, UX/UI design, and intent capture.                                   |
| **IDE Layer**           | Local development environments (VS Code, Cursor, JetBrains) where agents execute tasks. |
| **Orchestration Layer** | Offline-first IDSE Developer Orchestrator Agent controlling pipeline lifecycle.         |
| **Data Layer**          | Supabase as secure, centralized state and artifact archive.                             |

***

## 2 · Technical Context

| Domain                | Technology                               | Purpose                                                     |
| :-------------------- | :--------------------------------------- | :---------------------------------------------------------- |
| **Core Runtime**      | Python 3.12 (CLI Orchestrator)           | Manages IDSE pipeline and sync commands.                    |
| **Secondary Runtime** | Node.js 20+ (Design/JS prototypes)       | Supports external JS/React design workflows.                |
| **Database / API**    | Supabase (PostgreSQL + Realtime)         | Stores pipeline documents, metadata, and validation states. |
| **Sync Protocol**     | MCP (Machine-to-Cloud Protocol)          | Secure push/pull operations between IDEs and Supabase.      |
| **IDE Clients**       | VS Code, Cursor, JetBrains Gateway       | Local development sandboxes for AI and human agents.        |
| **Auth & Secrets**    | Supabase JWTs + local `.idseconfig.json` | Authenticated, ephemeral connections for sync.              |
| **CI / Validation**   | GitHub Actions + `validate_manifest.py`  | Ensures pipeline integrity and constitutional compliance.   |

***

## 3 · Organizational Context

| Aspect             | Detail                                                                       |
| :----------------- | :--------------------------------------------------------------------------- |
| **Structure**      | Hybrid organization — part AI agents, part human engineers and designers.    |
| **Governance**     | Operates under the *IDSE Constitution* (Articles I–IX).                      |
| **Collaboration**  | All contributors (human or agent) operate within structured pipeline stages. |
| **Knowledge Base** | Centralized documentation under `/docs/` and `idse-knowledge-manifest.json`. |
| **Communication**  | Conducted via orchestrator logs, MCP events, and project status dashboards.  |

***

## 4 · Operational Context

### Deployment Model

* **Local-first**: Each project runs within its own `/projects/<name>` workspace inside the IDE.

* **Agency-managed**: Supabase sync occurs only when `idse sync push` or `pull` is invoked.

* **Post-project cleanup**: Upon archive, IDE agents are removed and tokens revoked.

### Security Model

* Credentials stored in secure secret stores, not code.

* Supabase keys rotated periodically.

* MCP transport over HTTPS with signed requests.

* Project archives immutable once finalized.

### Performance Context

* All core commands (`init`, `validate`, `sync`) should complete <5 seconds locally.

* Validation must scale to 10+ concurrent IDE agents without conflict.

***

## 5 · Resource Context

| Resource                      | Description                                 | Access                               |
| :---------------------------- | :------------------------------------------ | :----------------------------------- |
| **Supabase Projects Table**   | Central repository for pipeline documents   | Read/write by Main Orchestrator only |
| **Templates (kb/templates/)** | Stage-specific Markdown scaffolds           | Read by TemplateLoader               |
| **Examples / Playbooks**      | Reference pipelines for training agents     | Read-only                            |
| **CI Validators**             | Python validation scripts under `/scripts/` | Invoked by Orchestrator              |
| **Logs**                      | `/projects/<name>/logs/`                    | Local file audit trail per project   |

***

## 6 · Stakeholder Context

| Stakeholder                   | System Role                  | Interaction                                        |
| :---------------------------- | :--------------------------- | :------------------------------------------------- |
| **Agency Director**           | Strategic oversight          | Reviews Supabase dashboard; approves archives      |
| **Lead Engineer / Architect** | Technical governance         | Uses Orchestrator CLI; validates specs and plans   |
| **Design Team**               | UI/UX prototyping            | Works externally; submits assets via plan.md       |
| **AI IDE Agents**             | Implementation execution     | Read/write in `/projects/`; report via feedback.md |
| **Developers**                | Final polish and integration | Merge code and finalize tests                      |
| **CI / Validator**            | Compliance enforcement       | Runs automatically; fails on `[REQUIRES INPUT]`    |

***

## 7 · Legal / Compliance Context

| Area                    | Policy                                                                                        |
| :---------------------- | :-------------------------------------------------------------------------------------------- |
| **Data Privacy**        | No user or client data stored in Supabase beyond project metadata.                            |
| **Source Control**      | `/projects/` excluded from version control via `.gitignore`.                                  |
| **Security Compliance** | Follows OWASP, SOC 2 Type II, and internal IDSE data handling standards.                      |
| **Licensing**           | Internal frameworks under open research license; client deliverables under custom agreements. |
| **Auditability**        | Every pipeline sync logged with timestamp, agent ID, and checksum.                            |

***

## 8 · Constraints

| Constraint                | Description                                               |
| :------------------------ | :-------------------------------------------------------- |
| **Offline Operation**     | Supabase access restricted to explicit sync events.       |
| **Agent Autonomy**        | IDE agents must never modify code outside assigned scope. |
| **Environment Diversity** | IDEs may vary; Orchestrator must abstract differences.    |
| **Resource Quotas**       | Supabase limited to 100MB per active project snapshot.    |
| **Timeouts**              | Sync connections auto-close after 30s idle time.          |

***

## 9 · External Systems Context Diagram

```
                ┌──────────────────────────────┐
                │   Design / JS Prototypes     │
                │   (Agency Sandbox)           │
                └────────────┬─────────────────┘
                             │
                  import / link components
                             │
┌────────────────────────────▼──────────────────────────┐
│         Local IDE + Orchestrator Environment          │
│  /projects/<name>/                                    │
│  • intent.md → feedback.md                            │
│  • session_state.json                                 │
│  • logs/sync.log                                      │
│                                                       │
│  IDSE CLI + MCP Client  ←→  IDE Agents (Claude/Codex) │
└────────────────────────────┬──────────────────────────┘
                             │
                        MCP HTTPS
                             │
                ┌────────────▼───────────────┐
                │     Supabase Cloud         │
                │  (projects + history)      │
                └────────────────────────────┘
```

***

## 10 · Contextual Risks

| Risk                         | Mitigation                                                         |
| :--------------------------- | :----------------------------------------------------------------- |
| **Sync Conflicts**           | Orchestrator merges based on timestamps + diffs.                   |
| **Token Exposure**           | Tokens stored in VS Code secret vault; never in code.              |
| **Spec Drift**               | CI validation required before sync.                                |
| **Human/AI Overlap**         | Stage ownership enforced through agent registry.                   |
| **Design/Code Misalignment** | Agency prototypes linked explicitly in plan.md; not auto-imported. |

***

## 11 · Context Summary

* The Agency operates within a **hybrid human-AI ecosystem**, balancing creative freedom with procedural rigor.

* All development occurs in **local isolated IDE environments**, orchestrated through the **IDSE pipeline**.

* **Supabase** serves as the **official record**, not as a live development backend.

* Syncs are **intentional, secure, and auditable**.

* Once a project is complete, the IDE agents are deactivated, and the Agency maintains a **final archived pipeline** for reference or reuse.e the mission statement and source of truth for core pipeline documents.ok save a snapsiot


### Prototyping UI/UX Components

The **IDSE Developer Agency** will utilize **Puck Editor** and **Storybook** to prototype UI/UX components effectively. This integration will enable rapid design iterations and testing, streamlining the development process.

### Data Storage Strategy

We will store **Shad and Tailwind CSS classes** along with relevant component metadata in **Supabase**. This strategic storage will facilitate the conversion of Puck Editor's JSON output into usable **JavaScript React** and **HTML code**, enhancing our capability to produce website pages efficiently for the IDE team.

### Agency Swarm Constitution

The creation of the **Agency Swarm Constitution** will provide a structured framework for the IDE team. This constitution will guide the development of agents for **Agentic projects** within this ecosystem, specifically within the **VSCode (Cursor)** environment.