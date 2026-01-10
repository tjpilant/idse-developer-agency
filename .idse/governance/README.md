# IDSE Governance Directory
**Single Source of Truth for Project Governance**

This directory contains the **actual governance documents** for this project.

---

## Directory Structure

```
.idse/governance/
├── README.md                          ← This file
├── IDSE_CONSTITUTION.md               ← Universal project governance (Articles I-X)
├── IDSE_PIPELINE.md                   ← Pipeline stage definitions
└── AGENCY_SWARM_CONSTITUTION.md       ← Agency Swarm framework governance (Articles AS-I through AS-XII)
```

---

## How Agents Access Governance

### Entry Points (Pointer Files)

Agents/IDEs look for instructions in their expected locations, which are **smart pointers** to this directory:

```
Root Files (Pointers):
├── CLAUDE.md               → Points to .idse/governance/ (Claude Code entry point)
├── AGENTS.md               → Points to .idse/governance/ (GPT Codex entry point)
└── .cursor/rules/          → References .idse/governance/ (Cursor IDE)
```

These pointer files exist **where agents expect them** but contain **minimal content**—just links to the actual governance documents here.

---

## Layered Governance Architecture

### Layer 1: Universal IDSE Constitution
**File**: [IDSE_CONSTITUTION.md](IDSE_CONSTITUTION.md)

**Applies to**: ALL projects using IDSE (any framework, any language)

**Governs**:
- Article I: Intentionality
- Article II: Context Integrity
- Article III: Stage Sequencing
- Article IV: Specification Integrity
- Article V: Constitutional Validation
- Article VI: Template-Driven Initialization
- Article VII: Plan Before Build
- Article VIII: Implementation Discipline
- Article IX: Feedback Incorporation
- Article X: Projects-Rooted Canonical Paths

---

### Layer 2: Framework Constitution
**File**: [AGENCY_SWARM_CONSTITUTION.md](AGENCY_SWARM_CONSTITUTION.md)

**Applies to**: Only projects building with Agency Swarm v1.0.0 framework

**Governs**:
- Article AS-I: Framework Background
- Article AS-II: Agent Structure Requirements
- Article AS-III: Development Workflow
- Article AS-IV: Tool Requirements
- Article AS-V: Instructions Standards
- Article AS-VI: Agency Creation Standards
- Article AS-VII: Testing Requirements
- Article AS-VIII: Environment Management
- Article AS-IX: File Creation Policy
- Article AS-X: Model Requirements
- Article AS-XI: Orchestration Responsibilities
- Article AS-XII: Detailed Workflow Reference

---

### Layer 3: Pipeline Definitions
**File**: [IDSE_PIPELINE.md](IDSE_PIPELINE.md)

**Applies to**: ALL projects using IDSE

**Defines**:
- Intent stage requirements
- Context stage requirements
- Specification stage requirements
- Plan stage requirements
- Tasks stage requirements
- Implementation stage requirements
- Feedback stage requirements

---

## Reading Order for Agents

When starting work on this project, agents should read in this order:

1. **[IDSE_CONSTITUTION.md](IDSE_CONSTITUTION.md)** - Universal governance rules
2. **[AGENCY_SWARM_CONSTITUTION.md](AGENCY_SWARM_CONSTITUTION.md)** - Framework-specific patterns
3. **[IDSE_PIPELINE.md](IDSE_PIPELINE.md)** - Pipeline stage details (as needed)
4. `.cursor/rules/workflow.mdc` - Step-by-step implementation workflow (as needed)

---

## Precedence Rules

When governance rules conflict, precedence is:

1. **IDSE_CONSTITUTION.md** - Highest authority for project structure
2. **AGENCY_SWARM_CONSTITUTION.md** - Authority for Agency Swarm implementation
3. **IDSE_PIPELINE.md** - Authority for pipeline stages
4. `.cursor/rules/workflow.mdc` - Authority for detailed workflow steps

If conflict persists, escalate to user.

---

## Why This Architecture?

### Single Source of Truth
- Actual content lives **only here** in `.idse/governance/`
- Pointer files (CLAUDE.md, AGENTS.md) reference this directory
- Changes made **once** apply to all agents/IDEs

### Separation of Concerns
- **Universal** governance (IDSE Constitution) separate from **framework-specific** governance (Agency Swarm Constitution)
- Clear boundaries between project structure and implementation patterns

### Agent Compatibility
- CLAUDE.md, AGENTS.md, .cursor/ exist where tools expect them
- Tools that look for instructions in standard locations still work
- No breaking changes to agent workflows

### Extensibility
- Easy to add new frameworks (Django, React, etc.) as additional Layer 2 constitutions
- Easy to add new universal articles to IDSE Constitution
- Easy to version governance documents independently

---

## For IDSE Orchestrator

When the IDSE Orchestrator package is used in **other repositories**, it will:

1. Bundle `IDSE_CONSTITUTION.md` and `IDSE_PIPELINE.md` (universal)
2. **NOT** bundle `AGENCY_SWARM_CONSTITUTION.md` (framework-specific)
3. Optionally copy framework constitutions based on `--framework` flag

Example:
```bash
# Generic project - gets IDSE Constitution only
idse init my-app

# Agency Swarm project - gets IDSE + Agency Swarm constitutions
idse init my-agency --framework agency-swarm
```

---

## Maintenance

### Updating Universal Governance
Edit [IDSE_CONSTITUTION.md](IDSE_CONSTITUTION.md) or [IDSE_PIPELINE.md](IDSE_PIPELINE.md).

**Also update** in orchestrator package:
- `idse-orchestrator/src/idse_orchestrator/governance/IDSE_CONSTITUTION.md`
- `idse-orchestrator/src/idse_orchestrator/governance/IDSE_PIPELINE.md`

### Updating Framework Governance
Edit [AGENCY_SWARM_CONSTITUTION.md](AGENCY_SWARM_CONSTITUTION.md).

**Only applies to this repository** (Agency Swarm projects).

### Adding New Framework
1. Create `.idse/governance/[FRAMEWORK]_CONSTITUTION.md`
2. Update pointer files (CLAUDE.md, AGENTS.md) to reference new framework
3. Add to orchestrator package under `frameworks/[framework]/`

---

## Related Documentation

- **Migration Strategy**: [projects/IDSE_Core/sessions/objective/implementation/MIGRATION_STRATEGY.md](../../projects/IDSE_Core/sessions/objective/implementation/MIGRATION_STRATEGY.md)
- **Governance Separation**: [projects/IDSE_Core/sessions/objective/implementation/GOVERNANCE_SEPARATION.md](../../projects/IDSE_Core/sessions/objective/implementation/GOVERNANCE_SEPARATION.md)
- **IDE Coordination**: `idse-governance/` (separate from this directory—handles Claude ↔ Codex handoffs)

---

*Last updated: 2026-01-10*
*Authority: IDSE Constitution Article I (Intentionality)*
