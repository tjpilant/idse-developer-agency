# IDSE-Governed Agency Builder Roles

Each conceptual sub-agent is a **role** implemented within the Agency Swarm codebase, governed by the **IDSE Constitution** and pipeline.

## Governance Reference
- IDSE Constitution: `docs/02-idse-constitution.md`
- IDSE Pipeline: `docs/03-idse-pipeline.md`
- Philosophy: `docs/01-idse-philosophy.md`

---

## api-researcher
**Stage:** Context  
**Purpose:** Discover and document external APIs, dependencies, and system constraints.  
**Governance:** Aligns with IDSE Context integrity.

## prd-creator
**Stage:** Specification  
**Purpose:** Translate project intent and context into an executable PRD and `spec.md`.  
**Governance:** Ensures specification completeness.

## tools-creator
**Stage:** Plan / Tasks  
**Purpose:** Define and implement tools, preferring MCP servers where suitable.  
**Governance:** Favors simplicity and anti-abstraction.

## agent-creator
**Stage:** Implementation  
**Purpose:** Build agent classes, `instructions.md`, and `agency.py` connections.  
**Governance:** Plan-before-build discipline.

## qa-tester
**Stage:** Feedback  
**Purpose:** Run and evaluate QA tests, capture improvements, and update feedback docs.  
**Governance:** Feedback incorporation and learning.

---

Each role is implemented as part of a single **IDSE Developer Agent** workflow. Sub-agents are conceptual constructs and code artifacts, not autonomous LLMs.

## Dynamic Roles & Handoff Protocol

⚠️ **Governance Layer**: The handoff protocol operates at the **IDE level**, not within Agency Swarm application code.

- IDE agents (Claude ↔ Codex inside VS Code) follow `idse-governance/protocols/handoff_protocol.md` with state tracking in `idse-governance/state/state.json`.
- Handoff templates live in `idse-governance/templates/handoff_templates/`.
- Layer enforcement via `.idse-layer` marker and `.cursor/config/idse-governance.json`.
- Honor `active_llm`/`awaiting_handoff` from the state file before performing work.
- **Critical**: Never write governance artifacts into application code directories (idse_developer_agent/, implementation/, src/, etc.)
