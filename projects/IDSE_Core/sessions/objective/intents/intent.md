## Intent - IDSE Developer Agency

## 1 · Purpose / Goal

To operate as a **meta-engineering and design agency** that builds, maintains, and orchestrates **Intent-Driven Systems Engineering (IDSE)** projects. The agency’s core mission is to bridge **human intent**, **AI-assisted development**, and **systematic engineering discipline**—turning high-level ideas into validated, production-ready systems using the IDSE methodology.

***

## 2 · Problem / Opportunity

### The Problem

Modern software projects often:

* Begin without clearly documented intent or context.

* Drift between design, AI agents, and implementation.

* Lack traceable reasoning between concept and code.

* Mix experimentation and production codebases, creating noise and compliance risk.

### The Opportunity

AI tools (ChatGPT, Claude, Codex, etc.) and human teams can collaborate within a unified structure if a governing orchestration system ensures:

* Clean separation of roles (intent, context, spec, plan, tasks, implementation, feedback).

* Automated compliance with constitutional development principles.

* Independent workspaces (IDE vs Agency vs Repo) that remain in sync only when required.

The **IDSE Developer Agency** provides this orchestration and culture.

***

## 3 · Vision

A world where **intent becomes the source code of design** — where human goals, AI reasoning, and engineering systems converge into a single, living development language.

Every project should be able to express:

> “This is what we meant to build, why we built it, how we built it, and what we learned.”

***

## 4 · Stakeholders / Users

| Role                                 | Responsibility                                              | Needs                                               |
| :----------------------------------- | :---------------------------------------------------------- | :-------------------------------------------------- |
| **Agency Lead / Architect**          | Oversees orchestration and quality.                         | Clarity, traceability, and simplicity.              |
| **Design Team**                      | Creates prototypes, UI/UX flows, and JS components.         | Freedom to experiment without breaking code.        |
| **IDE Agents (Claude, Codex, etc.)** | Implement plans and tasks within isolated IDE environments. | Clear, validated specs and controlled sync.         |
| **Developers / Engineers**           | Review and polish generated code; maintain tests.           | Structured documentation and task alignment.        |
| **Clients / Product Owners**         | Receive traceable artifacts and working systems.            | Transparency, reliability, and measurable outcomes. |

***

## 5 · Measurable Success Criteria

| Metric                            | Target                                                        |
| :-------------------------------- | :------------------------------------------------------------ |
| **Project Initialization Time**   | < 10 minutes from concept to full IDSE pipeline.              |
| **Spec-to-Code Alignment**        | ≥ 95% of implementation tasks trace directly to specs.        |
| **Feedback Loop Resolution Time** | < 24 hours from issue report to spec update.                  |
| **Supabase Sync Events**          | ≤ 3 per active project (init, mid-review, archive).           |
| **Compliance**                    | 100% of active projects validated with no `[REQUIRES INPUT]`. |
| **Auditability**                  | Every project archived with timestamp and validated state.    |

***

## 6 · Scope Boundaries

### In Scope

* Generation and management of IDSE pipelines (`intent.md` → `feedback.md`).

* Integration with IDEs (VS Code, Cursor) through local Orchestrator agents.

* Prototyping and design of JS/React pages and UI components using **Puck Editor** and **Storybook**.

* Controlled Supabase sync via MCP (manual, secure, on demand). The information includes the Shadnd and Tailwind CSS classes and components to facilitate the production of website pages by converting Puck Editor JSON output into React and HTML code for the IDE team.

* Project archival and agent deactivation upon completion.

### Out of Scope

* Continuous integration of code into production repos (handled separately by product teams).

* Permanent database connections or live document collaboration.

* Cloud hosting or runtime operations.

***

## 7 · Constraints / Risks

| Constraint             | Description                                                             |
| :--------------------- | :---------------------------------------------------------------------- |
| **Security**           | Tokens and Supabase credentials must remain outside IDE runtime memory. |
| **Version Control**    | `/projects/` directory excluded from main repo to avoid contamination.  |
| **Agent Coordination** | Requires standardized state tracking (`session_state.json`).            |
| **Human-AI Alignment** | Agency designers and IDE agents must follow the same spec templates.    |
| **Data Consistency**   | Supabase sync must avoid overwriting unsynced local changes.            |

***

## 8 · Priorities / Timing

| Phase       | Focus                                                                  | Timeline     |
| :---------- | :--------------------------------------------------------------------- | :----------- |
| **Phase 1** | Establish IDSE Agency identity, core docs, and Orchestrator prototype. | Immediate    |
| **Phase 2** | Integrate IDE agents + Supabase sync workflow.                         | Next 30 days |
| **Phase 3** | Add JS design prototyping pipeline.                                    | Next 60 days |
| **Phase 4** | Full deployment with project archival and analytics.                   | Next 90 days |

***

## 9 · Success Definition

The **IDSE Developer Agency** is successful when:

* It can launch a new project from intent to working code **without touching the repo manually**.

* IDE agents (Claude, Codex, etc.) operate autonomously but within constitutional IDSE bounds.

* The agency’s Orchestrator maintains complete audit trails in Supabase.

* Finished projects can remove the IDE team safely, leaving a clean, production-ready repo.

* Human teams and AI agents trust the same artifacts as the *source of truth*.

***

## 10 · Open Questions → \[REQUIRES INPUT]

1. Should the Agency maintain multiple Orchestrators (per client/project) or a single central one?
2. Should archived projects remain editable for internal training or be locked?
3. Should the Agency dashboard visualize project timelines and stage health?
4. How should billing/time tracking integrate with the pipeline (e.g., phase-based metrics)?


## 3.1 · Prototyping UI/UX Components

To leverage **Puck Editor** and **Storybook** for prototyping UI/UX components, ensuring a seamless design process and aiding in testing and validation.

## 6.1 · Scope Boundaries (Updated)

### In Scope (Updated)
* Prototyping and design of JS/React pages and UI components using **Puck Editor** and **Storybook**.
* Controlled Supabase sync via MCP, specifically storing **Shad and Tailwind CSS** classes and component information to facilitate the production of website pages by converting Puck Editor JSON output into usable **React** and **HTML code** for the IDE team.

## 10.1 · Agency Swarm Constitution

The creation of the **Agency Swarm Constitution** will serve as a guiding document for the IDE team to develop agents in support of projects conforming to this framework within **VSCode (Cursor)**.