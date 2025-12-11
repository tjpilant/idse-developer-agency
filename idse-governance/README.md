# IDSE Governance Layer

> ⚠️ **This is NOT application code.** This directory contains IDE-level coordination metadata for Claude ↔ Codex collaboration.

## Purpose

The IDSE Governance Layer provides a formalized system for dual-LLM (Claude and Codex) collaboration in VS Code, implementing the **Intent-Driven Systems Engineering (IDSE)** framework's handoff and feedback protocols.

## Directory Structure

```
idse-governance/
├── protocols/
│   └── handoff_protocol.md       # Defines handoff rules and state schema
├── state/
│   └── state.json                # Tracks which IDE agent is active
├── templates/
│   └── handoff_templates/        # Standard handoff message templates
│       ├── claude_to_codex_template.md
│       └── codex_to_claude_template.md
└── feedback/
    └── *.md                       # Handoff feedback and architectural notes
```

## Key Files

### Enforcement
- **`.idse-layer`** (project root) - Boundary marker declaring governance layer rules
- **`.cursor/config/idse-governance.json`** - Configuration enforcing path protection

### Validation
- **`.cursor/tasks/validate-idse-layer.sh`** - Script to verify governance layer integrity

### IDE Integration
- **`.vscode/tasks.json`** - VS Code tasks for governance mode and validation

## Critical Boundary Rules

1. **Never write governance artifacts into application code directories:**
   - ❌ `idse_developer_agent/`
   - ❌ `implementation/`
   - ❌ `src/`, `lib/`, `app/`

2. **Never write application code into the governance layer:**
   - ❌ Agency Swarm tools
   - ❌ Python modules
   - ❌ Runtime code

3. **This is IDE-level metadata only:**
   - Handoff coordination (which IDE agent is active)
   - State tracking (`active_llm`, `awaiting_handoff`)
   - Review feedback and role changes

## Usage

### Quick Start

**New to governance automation?** Start here: [QUICK_START.md](QUICK_START.md)

**Full automation guide:** [AUTOMATION.md](AUTOMATION.md)

### For Claude and Codex

Before performing any work, check the state:
```bash
# Via VS Code Task (Recommended)
Ctrl+Shift+P → "Tasks: Run Task" → "View IDSE State"

# Or via CLI
python3 .cursor/tasks/governance.py view
```

Verify you are the `active_llm` and `awaiting_handoff` is `false` before proceeding.

### VS Code Tasks (Automated)

**Handoffs:**
- **Handoff to Codex** - Transfer control to Codex with automatic state update
- **Handoff to Claude** - Transfer control to Claude with automatic state update
- **Acknowledge Handoff** - Confirm receipt of handoff

**Role Changes:**
- **Change Role to Builder/Reviewer/Planner/Implementer** - Switch roles with IDSE constitution references

**Utilities:**
- **View IDSE State** - Display current state (LLM, role, stage)
- **Change IDSE Stage** - Move between IDSE pipeline stages
- **Validate IDSE Governance Layer** - Run integrity checks
- **Enter IDSE Governance Mode** - Display governance rules

Access via: `Ctrl+Shift+P` → "Tasks: Run Task"

**See [AUTOMATION.md](AUTOMATION.md) for complete workflow examples.**

### Validation

Run the validation script manually:
```bash
bash .cursor/tasks/validate-idse-layer.sh
```

Or via VS Code task: "Validate IDSE Governance Layer"

## State Schema

```json
{
  "active_llm": "claude_code | codex_gpt",
  "awaiting_handoff": false,
  "handoff_cycle_id": "2025-12-11T21:45:00Z",
  "layer_scope": "governance",
  "enforced_paths": ["idse-governance/"],
  "role_change_event": {
    "from": "reviewer",
    "to": "builder",
    "reason": "...",
    "timestamp": "..."
  },
  "active_stage": "Intent | Context | Specification | Plan | Tasks | Implementation | Feedback",
  "last_handoff": {
    "from": "...",
    "to": "...",
    "timestamp": "...",
    "notes": "..."
  },
  "last_checked": "..."
}
```

## Handoff Protocol

See [`protocols/handoff_protocol.md`](protocols/handoff_protocol.md) for complete details.

**Quick reference:**
1. Check `state.json` to verify you're `active_llm`
2. Perform work (respecting governance boundaries)
3. When ready to handoff, create handoff document in `feedback/`
4. Update `state.json` with new `active_llm` and handoff details
5. Await acknowledgment from receiving LLM

## Governance References

- **IDSE Constitution:** `docs/02-idse-constitution.md`
- **IDSE Pipeline:** `docs/03-idse-pipeline.md`
- **Agency Swarm SOP:** `docs/idse-agency-swarm-sop.md`
- **Dynamic Roles:** `AGENTS.md`

## Version History

- **1.1.0** (2025-12-11) - Separated governance layer from application code, added guardrails
- **1.0.0** - Initial handoff protocol implementation

## Security & Guardrails

**🔒 Active LLM Verification:** All state-changing commands verify the caller is the active LLM. See [GUARDRAILS.md](GUARDRAILS.md) for complete details on:
- How guardrails work
- Test results
- Trust-based security model
- Bypass scenarios (not recommended)

## Architectural Notes

This layer was created to fix an architectural violation where handoff coordination was initially embedded inside Agency Swarm application code. See [`feedback/architectural_fix_2025-12-11.md`](feedback/architectural_fix_2025-12-11.md) for details.

---

**Remember:** This is an IDE operating system, not application code. Keep the boundary clear.
