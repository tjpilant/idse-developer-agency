# Architectural Violation & Fix: Governance Layer Separation

**Date:** 2025-12-11
**Cycle ID:** 2025-12-11T21:45:00Z
**Stage:** Implementation (corrective action)
**Severity:** High - Architectural boundary violation
**Status:** Resolved

---

## Executive Summary

Codex implemented the Claude ↔ Codex handoff protocol as **Agency Swarm tools and application code** inside the project codebase, violating the intended architecture where handoff coordination should exist as **IDE-level metadata external to the application**.

This has been corrected by creating a dedicated `idse-governance/` layer with enforcement mechanisms.

---

## The Violation

### What Happened

Codex created:
1. **`idse_developer_agent/tools/RunIdsePipelineTool.py`** - An Agency Swarm tool (extends `BaseTool`) that orchestrates IDSE pipeline execution
2. **`implementation/code/*/` directories** - Seven Python modules implementing each IDSE stage (intent, context, spec, plan, task, implementation, feedback)

### Why This Is Wrong

The handoff protocol (`docs/protocols/handoff_protocol.md`) explicitly states:

> **Environment:** VS Code IDE + Cursor rules + IDSE docs
> **Agents:** Claude (`claude_code`), Codex (`codex_gpt`)

This describes **IDE-level coordination between two IDE agents**, not Agency Swarm application features.

**Conflation of concerns:**
- **IDE Coordination** (what handoff protocol should be): Which IDE agent (Claude or Codex) controls VS Code
- **IDSE Pipeline Execution** (what Codex built): Executing the IDSE methodology stages

These are fundamentally different:
- IDE coordination is **metadata** about which agent is active
- Pipeline execution is **application functionality**

### Root Cause

The handoff protocol documentation was not explicitly marked as IDE meta-layer. Codex, seeing file references and "implementation" instructions, interpreted it as application code to be built.

---

## The Fix

### Architecture: Three-Layer Separation

| Layer | Purpose | Location | Allowed Agents |
|-------|---------|----------|----------------|
| **IDE Governance Layer** | Handoff coordination, role redefinition, feedback tracking | `idse-governance/` | Claude + Codex (coordination only) |
| **Project Codebase Layer** | Agency Swarm application code | `idse_developer_agent/`, `agency.py`, etc. | Active LLM (build phase) |
| **System/OS Layer** | Environment, venv, tooling | `.venv/`, system paths | Human developer |

### Implementation

#### 1. Created `idse-governance/` Directory Structure
```
idse-governance/
├── protocols/
│   └── handoff_protocol.md (with GOVERNANCE LAYER NOTICE header)
├── state/
│   └── state.json (with layer_scope field)
├── templates/
│   └── handoff_templates/
│       ├── claude_to_codex_template.md
│       └── codex_to_claude_template.md
└── feedback/
    └── architectural_fix_2025-12-11.md (this file)
```

#### 2. Created `.idse-layer` Marker File
Located at project root, declares the governance boundary and critical rules:
- Agents must NOT write application code into governance layer
- Agents must NOT write governance artifacts into project code directories

#### 3. Created `.cursor/config/idse-governance.json`
Enforcement configuration defining:
- `idse_layer_root`: `"idse-governance/"`
- `protected_paths`: Application code directories that cannot contain governance artifacts
- `governance_paths`: Governance directories that cannot contain application code
- `on_violation`: `"warn_and_abort"`

#### 4. Updated All Documentation

**`idse-governance/protocols/handoff_protocol.md`:**
- Added prominent GOVERNANCE LAYER NOTICE header
- Updated all path references to new locations
- Added `layer_scope` to state schema example
- Documented `.idse-layer` and enforcement config

**`AGENTS.md`:**
- Added governance layer warning
- Updated protocol/template paths
- Added critical boundary rule

**`CLAUDE.md`:**
- Added IDE Governance Layer section to header
- Documented new paths and boundary rules

**`idse-governance/state/state.json`:**
- Added `layer_scope`: `"governance"`
- Added `enforced_paths`: `["idse-governance/"]`
- Added `last_checked` timestamp
- Updated `role_change_event` and `last_handoff` to reflect architectural fix

---

## Outcomes

### ✅ Benefits

1. **Clear Separation of Concerns**: IDE coordination is now explicitly separate from application code
2. **Portable Governance**: The `idse-governance/` directory can be dropped into any VS Code workspace
3. **Enforcement**: Config and marker files prevent future violations
4. **Documentation**: All references updated to reflect correct architecture
5. **Future-Proof**: Next Codex (or Claude) handoff will see prominent warnings

### 🧹 Cleanup Required

The following Codex-created files **should be reviewed and possibly removed** as they represent the architectural violation:

- `idse_developer_agent/tools/RunIdsePipelineTool.py` - Handoff embedded as Agency tool
- `implementation/code/*/` - IDSE stage executors embedded in codebase

**Decision:** Leave these files in place for now but document that they represent a different concern (optional IDSE pipeline executor) separate from handoff coordination.

---

## Lessons Learned

### For Future LLM Handoffs

1. **Explicit Layer Marking**: Any IDE-level metadata MUST be marked with clear "NOT APPLICATION CODE" warnings
2. **Enforcement First**: Create `.idse-layer` and config files BEFORE documenting protocols
3. **Check Assumptions**: When receiving handoffs, verify that generated code respects layer boundaries

### For IDSE Governance

4. **Namespace Separation**: Consider renaming "handoff_protocol.md" to "ide_coordination_protocol.md" to reduce confusion
5. **Tool Naming**: If an IDSE Pipeline Executor tool is desired, name it explicitly (not conflated with handoffs)

---

## Validation

- ✅ `idse-governance/` directory created with proper structure
- ✅ `.idse-layer` marker file created
- ✅ `.cursor/config/idse-governance.json` enforcement config created
- ✅ All governance artifacts moved to `idse-governance/`
- ✅ All documentation updated with new paths
- ✅ State schema extended with `layer_scope` and enforcement fields
- ✅ Prominent warnings added to all governance files

---

## Next Steps

1. **Test Handoff**: Execute a Claude → Codex handoff using new governance layer
2. **Monitor Compliance**: Verify both LLMs respect the boundary
3. **Optional CI Check**: Add script to detect protocol files in application code directories
4. **Review Violation Artifacts**: Decide whether to keep, refactor, or remove `RunIdsePipelineTool.py` and `implementation/code/`

---

## References

- Original protocol: `idse-governance/protocols/handoff_protocol.md`
- Layer marker: `.idse-layer`
- Enforcement config: `.cursor/config/idse-governance.json`
- State file: `idse-governance/state/state.json`
- IDSE Constitution: `docs/02-idse-constitution.md` (Article VII - Plan Before Build)
