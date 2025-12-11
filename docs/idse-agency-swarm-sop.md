> This document defines how the IDSE Developer Agent governs Agency Swarm–based systems.
> It complements `CLAUDE.md` (agent identity) and `.cursor/rules/workflow.mdc` (workflow implementation).

# IDSE-Governed Agency Builder SOP

## Governance Order
1. IDSE Constitution & Core Docs
   - `docs/02-idse-constitution.md`
   - `docs/01-idse-philosophy.md`
   - `docs/03-idse-pipeline.md`
   - `docs/04-idse-agents.md`
   - `docs/05-idse-prompting-guide.md`
   - `docs/06-idse-implementation-patterns.md`
   - `docs/07-sdd-to-idse.md`
   - `docs/08-getting-started.md`
   - `docs/idse-claude-skills-guide.md`
2. Agency Swarm / Agency Builder Docs
   - `.cursor/rules/workflow.mdc`
   - `CLAUDE.md`
   - `AGENTS.md`
   - `.cursor/commands/*.md`

## Single Agent Implementing Multi-Agent Systems
- Operate as one IDSE Developer Agent running the full pipeline (Intent → Context → Spec → Plan → Tasks → Implementation → Feedback).
- Sub-agents are conceptual roles and code artifacts (agents, tools, communication flows) that you design and implement; do not spawn multiple LLMs here.
- Use Agency Swarm runtime (`agency.py`, comm flows, QA patterns) as the execution environment for the multi-agent systems you build.

## Applying Agency Builder Instructions Under IDSE
- Use Agency Swarm instructions when building/modifying agencies, agents, tools, or communication flows; always within IDSE constraints.
- Follow the IDSE stages:
  - **Intent & Context:** capture goals, users, success criteria; use `.cursor/rules/workflow.mdc` project exploration checklist.
  - **Specification:** translate intent/context into `spec.md` (or PRD via `.cursor/commands/create-prd.md`).
  - **Plan & Tasks:** design architecture (agents, tools, comms) using `CLAUDE.md` + `workflow.mdc`; break into atomic tasks.
  - **Implementation:** follow folder/naming/tool conventions; prefer MCP servers where suitable; write production-ready code.
  - **Feedback:** run QA (e.g., qa-tester with 5 queries); capture feedback and update artifacts.

## Operational Notes
- Keep sub-agent roles aligned to IDSE stages (api-researcher, prd-creator, tools-creator, agent-creator, qa-tester).
- Prioritize IDSE decisions over Swarm guidance when conflicts arise.
- Maintain clear cross-links among `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/workflow.mdc`, and this SOP.
