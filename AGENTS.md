# GPT Codex Instructions
**Smart Pointer to Layered Governance**

This file is the **entry point** for GPT Codex. It points to the actual governance documents.

---

## Governance Layers

This project operates under **layered governance**:

### Layer 1: Universal IDSE Constitution (Always Active)
**Location**: [.idse/governance/IDSE_CONSTITUTION.md](.idse/governance/IDSE_CONSTITUTION.md)

**Governs**:
- Project structure (Article X - Projects-rooted sessions)
- Pipeline stages (Intent → Context → Spec → Plan → Tasks → Implementation → Feedback)
- Session management and validation
- Constitutional compliance

**Read this FIRST** for universal project governance rules.

---

### Layer 2: Framework Constitution (Active for This Project)
**Location**: [.idse/governance/AGENCY_SWARM_CONSTITUTION.md](.idse/governance/AGENCY_SWARM_CONSTITUTION.md)

**Governs** (Agency Swarm v1.0.0 specific):
- Agent structure and development workflow
- Tool requirements (MCP priority, custom tool standards)
- Instructions writing standards
- Agency creation patterns
- Testing requirements
- Orchestration responsibilities

**Read this SECOND** for Agency Swarm implementation details.

---

### Layer 3: IDE Coordination (Claude ↔ Codex Handoffs)
**Location**: `idse-governance/` directory

⚠️ **Critical Boundary**: This is **IDE-level coordination metadata**, NOT application code.

**Files**:
- [idse-governance/protocols/handoff_protocol.md](idse-governance/protocols/handoff_protocol.md) - Handoff procedures
- [idse-governance/state/state.json](idse-governance/state/state.json) - Active LLM tracking
- [idse-governance/templates/handoff_templates/](idse-governance/templates/handoff_templates/) - Handoff templates

**Governance script**: [.cursor/tasks/governance.py](.cursor/tasks/governance.py)

**Never write governance artifacts into application code directories** (idse_developer_agent/, src/, backend/, frontend/).
**Never write application code into governance directories** (idse-governance/, .idse/governance/).

---

## Quick Reference: What Am I Working On?

### Check Active Session
```bash
cat .idse_active_session.json
```

### Check My Role
```bash
python3 .cursor/tasks/governance.py view
```

### Validate Current Work
```bash
source .venv-orchestrator/bin/activate
idse validate
```

---

## IDSE-Governed Agency Builder Roles

Each conceptual sub-agent is a **role** implemented within the Agency Swarm codebase, governed by the **IDSE Constitution** and pipeline.

### Governance Reference
- IDSE Constitution: [.idse/governance/IDSE_CONSTITUTION.md](.idse/governance/IDSE_CONSTITUTION.md)
- IDSE Pipeline: [.idse/governance/IDSE_PIPELINE.md](.idse/governance/IDSE_PIPELINE.md)
- Philosophy: [docs/01-idse-philosophy.md](docs/01-idse-philosophy.md)

---

### api-researcher
**Stage**: Context
**Purpose**: Discover and document external APIs, dependencies, and system constraints.
**Governance**: Aligns with IDSE Context integrity.

### prd-creator
**Stage**: Specification
**Purpose**: Translate project intent and context into an executable PRD and `spec.md`.
**Governance**: Ensures specification completeness.

### tools-creator
**Stage**: Plan / Tasks
**Purpose**: Define and implement tools, preferring MCP servers where suitable.
**Governance**: Favors simplicity and anti-abstraction.

### agent-creator
**Stage**: Implementation
**Purpose**: Build agent classes, `instructions.md`, and `agency.py` connections.
**Governance**: Plan-before-build discipline.

### qa-tester
**Stage**: Feedback
**Purpose**: Run and evaluate QA tests, capture improvements, and update feedback docs.
**Governance**: Feedback incorporation and learning.

---

Each role is implemented as part of a single **IDSE Developer Agent** workflow. Sub-agents are conceptual constructs and code artifacts, not autonomous LLMs.

---

## Dynamic Roles & Handoff Protocol

⚠️ **Governance Layer**: The handoff protocol operates at the **IDE level**, not within Agency Swarm application code.

- IDE agents (Claude ↔ Codex inside VS Code) follow [idse-governance/protocols/handoff_protocol.md](idse-governance/protocols/handoff_protocol.md) with state tracking in [idse-governance/state/state.json](idse-governance/state/state.json).
- Handoff templates live in [idse-governance/templates/handoff_templates/](idse-governance/templates/handoff_templates/).
- Layer enforcement via `.idse-layer` marker and `.cursor/config/idse-governance.json`.
- Honor `active_llm`/`awaiting_handoff` from the state file before performing work.
- **Critical**: Never write governance artifacts into application code directories (idse_developer_agent/, implementation/, src/, etc.)

---

## IDSE Project Structure (Article X)

When creating a new project, ALWAYS follow this **projects-rooted** structure:

```
[repository_root]/
├── projects/
│   └── [ProjectName]/
│       ├── CURRENT_SESSION                 ← Pointer to active session
│       └── sessions/
│           └── session-[id]/
│               ├── intents/intent.md
│               ├── contexts/context.md
│               ├── specs/spec.md
│               ├── plans/plan.md
│               ├── tasks/tasks.md
│               ├── implementation/         ← Documentation ONLY
│               │   ├── README.md
│               │   └── validation-reports/
│               ├── feedback/feedback.md
│               └── metadata/.owner
```

### Guardrails for Project Creation

1. **ALWAYS** create session artifacts under `projects/[ProjectName]/sessions/session-[id]/`
2. **ALWAYS** update `projects/[ProjectName]/CURRENT_SESSION` pointer
3. **NEVER** create project folders outside IDSE pipeline structure
4. **ALWAYS** follow pipeline: Intent → Context → Spec → Plan → Tasks → Implementation → Feedback
5. **CRITICAL**: `implementation/` contains **DOCUMENTATION ONLY** (validation reports, code examples in markdown, handoff records)
   - **NOT** production code, working schemas, or executable artifacts
   - Production code lives in codebase directories (src/, backend/, frontend/, etc.)
   - The IDSE Agency produces documentation; the IDE team produces code

---

## Repository Context

**This repository**: IDSE Developer Agency
- Builds the **IDSE Orchestrator** (pip-installable CLI)
- Uses **Agency Swarm framework** to build AI agent systems
- Follows **IDSE Constitution** for project management

**What is IDSE Orchestrator?**
- Pip-installable package: `pip install -e idse-orchestrator/`
- Commands: `idse init`, `idse validate`, `idse sync`, `idse status`
- Creates Article X compliant session structures
- Validates against IDSE Constitution
- Syncs with Agency Core (when built)

---

## Workflow References (Detailed Implementation)

For step-by-step Agency Swarm workflows:
- [.cursor/rules/workflow.mdc](.cursor/rules/workflow.mdc) - Complete agent creation workflow
- [.cursor/commands/add-mcp.md](.cursor/commands/add-mcp.md) - MCP server integration
- [.cursor/commands/write-instructions.md](.cursor/commands/write-instructions.md) - Instruction writing
- [.cursor/commands/create-prd.md](.cursor/commands/create-prd.md) - PRD creation

For IDSE pipeline details:
- [.idse/governance/IDSE_PIPELINE.md](.idse/governance/IDSE_PIPELINE.md) - Pipeline stage definitions

For Agency Swarm governance:
- [.idse/governance/AGENCY_SWARM_CONSTITUTION.md](.idse/governance/AGENCY_SWARM_CONSTITUTION.md) - Framework constitution

---

## Agency Builder (Orchestration Role)

When orchestrating sub-agents to build agencies, see Article AS-XI in [AGENCY_SWARM_CONSTITUTION.md](.idse/governance/AGENCY_SWARM_CONSTITUTION.md).

**Available sub-agents**:
- **api-researcher**: Researches MCP servers and APIs, saves docs locally
- **prd-creator**: Transforms concepts into PRDs using saved API docs
- **agent-creator**: Creates complete agent modules with folder structure
- **tools-creator**: Implements tools prioritizing MCP servers over custom APIs
- **instructions-writer**: Write optimized instructions using prompt engineering best practices
- **qa-tester**: Test agents with actual interactions and tool validation

**Key orchestration patterns**:
- **Phased Execution**: agent-creator + instructions-writer first, THEN tools-creator
- **PRD Confirmation**: Always get user approval before development
- **API Keys First**: Collect ALL keys with instructions before any development
- **MCP Priority**: Always prefer MCP servers over custom tools
- **Testing**: All tools must pass individual tests before agency testing

---

## Environment Setup (Critical)

Before ANY work, verify virtual environment:

```bash
# Check if in venv
which python  # Should show: .venv/bin/python

# If not, activate
source .venv/bin/activate

# For orchestrator work
source .venv-orchestrator/bin/activate

# Install dependencies
pip install -r requirements.txt
```

⚠️ **Common Issue**: `python3 agency.py` may use system Python. Always activate venv first.

---

## Key Principles

1. **Read governance layers in order**: IDSE Constitution → Agency Swarm Constitution → IDE Coordination
2. **Follow IDSE pipeline** for all project work
3. **Respect layer boundaries**: Don't mix governance and application code
4. **Test before declaring complete**: All tools and agencies must pass tests
5. **Production-ready code only**: No placeholders, mocks, or TODOs
6. **MCP servers first**: Always search for MCP servers before writing custom tools

---

## Precedence (When Rules Conflict)

1. `.idse/governance/IDSE_CONSTITUTION.md` - Universal project governance
2. `.idse/governance/AGENCY_SWARM_CONSTITUTION.md` - Framework-specific patterns
3. `idse-governance/protocols/handoff_protocol.md` - IDE coordination
4. `.cursor/rules/workflow.mdc` - Detailed implementation steps

If conflict persists, escalate to user.

---

## Current Migration Status

We are in the process of:
- ✅ Phase 0: IDSE Orchestrator package (COMPLETE)
- 🔄 Separating governance layers (IN PROGRESS)
- 🔄 Building Supabase backend (NEXT)

See: [projects/IDSE_Core/sessions/objective/implementation/MIGRATION_STRATEGY.md](projects/IDSE_Core/sessions/objective/implementation/MIGRATION_STRATEGY.md)

---

*This is a pointer file. For actual governance content, see `.idse/governance/` directory.*

*Last updated: 2026-01-10*
