# IDSE + Agency Swarm Governance Separation
**Separating Universal IDSE Constitution from Framework-Specific Instructions**

## Problem Statement

Currently, IDSE governance (universal project methodology) is conflated with Agency Swarm development instructions (framework-specific). This creates confusion when:

1. **Using IDSE Orchestrator on non-Agency-Swarm projects** → Users get irrelevant Agency Swarm instructions
2. **Building Agency Swarm projects** → Need both IDSE governance AND Agency Swarm patterns
3. **Onboarding new agents** → Unclear which instructions are universal vs. framework-specific

## Current File Structure (Conflated)

```
/home/tjpilant/projects/idse-developer-agency/
├── CLAUDE.md                         ← IDSE governance + Agency Swarm instructions (MIXED)
├── .cursor/
│   └── rules/
│       └── workflow.mdc              ← Agency Swarm specific workflow
├── Agents.md                         ← Agent-specific instructions
├── docs/
│   ├── 02-idse-constitution.md       ← Universal IDSE governance
│   ├── 03-idse-pipeline.md           ← Universal IDSE pipeline
│   └── idse-agency-swarm-sop.md      ← IDSE + Agency Swarm integration
```

**Problems**:
- CLAUDE.md has both universal and framework-specific instructions
- No clean separation between "what is IDSE" vs. "what is Agency Swarm"
- Orchestrator doesn't know which instructions to inject based on project type

---

## Proposed Architecture: Layered Governance

### Layer 1: Universal IDSE Constitution (Core)

**Location**: Bundled in `idse-orchestrator` package

```
idse-orchestrator/
└── src/idse_orchestrator/
    └── governance/
        ├── IDSE_CONSTITUTION.md         ← Articles I-X (universal)
        ├── IDSE_PIPELINE.md             ← Pipeline stages (universal)
        └── agent_base_instructions.md   ← Generic agent guidance
```

**Contents**:
- Article I-X of IDSE Constitution
- Pipeline stage definitions (Intent → Feedback)
- Session management rules
- Validation requirements
- **NO framework-specific instructions**

**Applies to**: ALL projects using IDSE Orchestrator

---

### Layer 2: Framework Constitution (Optional Add-On)

**Location**: Framework-specific packages or templates

```
idse-orchestrator/
└── src/idse_orchestrator/
    └── frameworks/
        ├── agency_swarm/
        │   ├── AGENCY_CONSTITUTION.md     ← Agency Swarm governance
        │   ├── agent_instructions.md      ← How to build agents
        │   ├── workflow.md                ← Agency Swarm workflow
        │   └── templates/                 ← Agency Swarm templates
        ├── django/
        │   ├── DJANGO_CONSTITUTION.md
        │   └── templates/
        └── react/
            ├── REACT_CONSTITUTION.md
            └── templates/
```

**Contents (Agency Swarm example)**:
- How to build Agency Swarm agents
- Communication flow patterns
- Tool development guidelines
- MCP server integration
- Testing procedures
- **References IDSE Constitution as base layer**

**Applies to**: Only projects with `--framework agency-swarm` flag

---

### Layer 3: Project-Specific Extensions (User-Defined)

**Location**: User's project directory

```
.idse/
└── config/
    ├── project_constitution.md       ← Project-specific rules
    ├── agent_registry.json           ← Agent assignments
    └── custom_templates/             ← Project templates
```

**Contents**:
- Project-specific governance rules
- Custom agent roles
- Domain-specific validation rules

**Applies to**: Only the specific project

---

## Implementation in IDSE Orchestrator

### 1. Detect Project Framework

When running `idse init`:

```bash
# Option A: Explicit flag
idse init my-agency --framework agency-swarm

# Option B: Auto-detect from existing files
idse init .  # Detects agency.py → sets framework=agency-swarm

# Option C: Interactive prompt
idse init my-project
# → "What framework? (1) None (2) Agency Swarm (3) Django (4) React"
```

### 2. Store Framework in Metadata

```json
// .idse/config/project_config.json
{
  "project_name": "my-agency",
  "framework": "agency-swarm",  // or null for generic
  "idse_version": "0.1.0",
  "created_at": "2026-01-10T..."
}
```

### 3. Inject Layered Instructions

When agents read instructions:

```python
# idse-orchestrator/src/idse_orchestrator/instruction_loader.py

def load_instructions(project_path: Path) -> str:
    """Load layered governance instructions based on project framework."""

    # Layer 1: Universal IDSE Constitution (always included)
    base_instructions = load_resource("governance/IDSE_CONSTITUTION.md")

    # Layer 2: Framework-specific (if applicable)
    config = load_project_config(project_path)
    framework_instructions = ""
    if config.get("framework"):
        framework_instructions = load_resource(
            f"frameworks/{config['framework']}/AGENCY_CONSTITUTION.md"
        )

    # Layer 3: Project-specific (if exists)
    project_instructions = ""
    project_const = project_path / ".idse/config/project_constitution.md"
    if project_const.exists():
        project_instructions = project_const.read_text()

    # Combine with clear delimiters
    return f"""
# IDSE Governance (Universal)
{base_instructions}

{"# Framework: " + config.get("framework", "none") if framework_instructions else ""}
{framework_instructions}

{"# Project-Specific Extensions" if project_instructions else ""}
{project_instructions}
"""
```

---

## Agency Swarm Constitution Structure

### AGENCY_CONSTITUTION.md

```markdown
# Agency Swarm Framework Constitution
**Framework-Specific Governance for Agency Swarm Projects**

⚠️ **Prerequisites**: This constitution extends the IDSE Constitution (Articles I-X).
Read IDSE_CONSTITUTION.md first.

---

## Article AS-I: Agency Structure
All agencies must follow Agency Swarm v1.0.0 patterns:
1. Agents have realistic job-based roles (not task-based)
2. Communication flows are explicit and directional
3. Tools are atomic, standalone, and composable

## Article AS-II: Agent Development Workflow
Agents must be developed in this order:
1. Create agent template via CLI
2. Develop tools (prioritize MCP servers)
3. Write instructions.md
4. Create agency.py with communication flows
5. Test each tool individually
6. Test agency end-to-end

## Article AS-III: Tool Requirements
All tools must:
1. Perform real-world actions (no abstract tools)
2. Retrieve API keys from environment variables
3. Include test cases in `if __name__ == "__main__"`
4. Be production-ready (no placeholders)

## Article AS-IV: MCP Server Priority
When functionality exists in an MCP server, use it instead of custom tools.
Search for MCP servers before writing custom code.

## Article AS-V: Testing Requirements
Before declaring an agency complete:
1. All tools must pass individual tests
2. Agency must respond to 5 test queries successfully
3. No errors in terminal output
4. All API keys configured in .env

---

## Workflow Reference
For detailed step-by-step workflow, see: workflow.md
For agent instruction writing, see: agent_instructions.md
```

### workflow.md

```markdown
# Agency Swarm Development Workflow
**Step-by-step guide for building agencies**

⚠️ **Assumes**: You've completed IDSE Intent → Context → Spec → Plan → Tasks stages.
This workflow applies to the **Implementation** stage.

## Step 1: Environment Setup
...
(Content from current .cursor/rules/workflow.mdc)
```

### agent_instructions.md

```markdown
# Agent Instruction Writing Guide
**How to write effective instructions.md files for agents**

...
(Content from current .cursor/commands/write-instructions.md)
```

---

## Migration Plan for This Repo

### Current Files → New Structure

| Current File | New Location | Type |
|-------------|-------------|------|
| `docs/02-idse-constitution.md` | `idse-orchestrator/src/idse_orchestrator/governance/IDSE_CONSTITUTION.md` | Universal |
| `docs/03-idse-pipeline.md` | `idse-orchestrator/src/idse_orchestrator/governance/IDSE_PIPELINE.md` | Universal |
| `.cursor/rules/workflow.mdc` | `idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/workflow.md` | Framework |
| `.cursor/commands/write-instructions.md` | `idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/agent_instructions.md` | Framework |
| `.cursor/commands/add-mcp.md` | `idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/mcp_integration.md` | Framework |
| `CLAUDE.md` (IDSE parts) | `idse-orchestrator/src/idse_orchestrator/governance/` | Universal |
| `CLAUDE.md` (Agency parts) | `idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/AGENCY_CONSTITUTION.md` | Framework |

### Steps to Migrate

1. **Extract Universal Parts from CLAUDE.md**
   - IDSE governance header → IDSE_CONSTITUTION.md
   - Project structure rules → IDSE_CONSTITUTION.md Article X
   - Guardrails → IDSE_CONSTITUTION.md

2. **Extract Framework Parts from CLAUDE.md**
   - Agency Builder section → AGENCY_CONSTITUTION.md
   - Sub-agent orchestration → workflow.md
   - Workflows → workflow.md

3. **Create Framework Package**
   ```
   idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/
   ├── AGENCY_CONSTITUTION.md
   ├── workflow.md
   ├── agent_instructions.md
   ├── mcp_integration.md
   ├── tool_development.md
   └── templates/
       ├── agent_template/
       ├── tool_template.py
       └── agency_template.py
   ```

4. **Update CLAUDE.md to Reference Layers**
   ```markdown
   # IDSE Governance Header
   This agent operates under layered governance:

   ## Layer 1: IDSE Constitution (Universal)
   See: idse-orchestrator/src/idse_orchestrator/governance/IDSE_CONSTITUTION.md

   ## Layer 2: Agency Swarm Framework (This Project)
   See: idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/AGENCY_CONSTITUTION.md

   ## Layer 3: Project-Specific
   See: .idse/config/project_constitution.md (if exists)
   ```

---

## Usage Examples

### Example 1: Generic Python Project

```bash
idse init data-pipeline --stack python
# Creates: .idse/projects/data-pipeline/
# Includes: IDSE_CONSTITUTION.md only (no framework)
# Agents see: Universal IDSE governance only
```

### Example 2: Agency Swarm Project

```bash
idse init customer-support-agency --framework agency-swarm
# Creates: .idse/projects/customer-support-agency/
# Includes: IDSE_CONSTITUTION.md + AGENCY_CONSTITUTION.md
# Agents see: Universal IDSE + Agency Swarm patterns
```

### Example 3: Django Project with Custom Rules

```bash
idse init ecommerce-api --framework django
# Creates: .idse/projects/ecommerce-api/
# User adds: .idse/config/project_constitution.md with:
#   "All API endpoints must use DRF serializers"
# Agents see: Universal IDSE + Django patterns + project rules
```

---

## Agent Instruction Loading Flow

```
Agent starts task
     ↓
Check .idse/config/project_config.json
     ↓
Load IDSE_CONSTITUTION.md (Layer 1 - always)
     ↓
framework = "agency-swarm"?
     ↓ YES
Load AGENCY_CONSTITUTION.md (Layer 2)
Load workflow.md
Load agent_instructions.md
     ↓
.idse/config/project_constitution.md exists?
     ↓ YES
Load project_constitution.md (Layer 3)
     ↓
Combine all layers → Agent instruction context
     ↓
Agent proceeds with layered governance
```

---

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Universal IDSE rules separate from framework-specific rules
- Clear hierarchy: IDSE → Framework → Project

### 2. **Reusability**
- IDSE Orchestrator works with ANY framework
- Agency Swarm constitution reusable across all Agency projects

### 3. **Extensibility**
- Easy to add new frameworks (Django, React, etc.)
- Users can add project-specific rules without modifying core

### 4. **Clarity for Agents**
- Agents know which instructions are universal vs. contextual
- No confusion about "do I follow this in a Django project?"

### 5. **Maintainability**
- Update IDSE Constitution once → applies to all projects
- Update Agency Swarm constitution → applies to all agencies
- No duplication across files

---

## Implementation Checklist

### Phase 1: Extract and Organize
- [ ] Create `idse-orchestrator/src/idse_orchestrator/governance/` directory
- [ ] Move `docs/02-idse-constitution.md` → `IDSE_CONSTITUTION.md`
- [ ] Move `docs/03-idse-pipeline.md` → `IDSE_PIPELINE.md`
- [ ] Extract IDSE parts from CLAUDE.md → governance/

### Phase 2: Create Agency Swarm Framework
- [ ] Create `idse-orchestrator/src/idse_orchestrator/frameworks/agency_swarm/` directory
- [ ] Create `AGENCY_CONSTITUTION.md` with Articles AS-I through AS-V
- [ ] Move `.cursor/rules/workflow.mdc` → `workflow.md`
- [ ] Move `.cursor/commands/write-instructions.md` → `agent_instructions.md`
- [ ] Move `.cursor/commands/add-mcp.md` → `mcp_integration.md`
- [ ] Extract Agency Swarm parts from CLAUDE.md → framework/

### Phase 3: Update Orchestrator
- [ ] Add `--framework` flag to `idse init` command
- [ ] Implement framework auto-detection
- [ ] Create `project_config.json` schema
- [ ] Implement `instruction_loader.py` with layered loading
- [ ] Update templates to include framework-specific sections

### Phase 4: Update This Repo
- [ ] Rewrite CLAUDE.md to reference layers
- [ ] Update Agents.md to reference AGENCY_CONSTITUTION.md
- [ ] Add `.idse/config/project_config.json` with `framework: "agency-swarm"`
- [ ] Test that agents receive correct layered instructions

### Phase 5: Documentation
- [ ] Document framework selection in README
- [ ] Create framework development guide (how to add new frameworks)
- [ ] Update migration guide with governance separation

---

## Open Questions

1. **Should frameworks be plugins or built-in?**
   - Built-in: Ship with orchestrator (easier distribution)
   - Plugins: Separate packages (more flexible, larger ecosystem)

2. **How to handle framework version compatibility?**
   - Lock framework version to orchestrator version?
   - Allow framework updates independently?

3. **Should project_constitution.md support templates?**
   - Allow users to create reusable project templates?
   - Or always start from scratch?

4. **How to handle conflicting rules across layers?**
   - Layer 3 overrides Layer 2 overrides Layer 1?
   - Or validation errors when conflicts detected?

---

## Next Steps

**Immediate**: Decide on built-in vs. plugin approach for frameworks

**Then**: Execute Phase 1-2 (extraction and organization)

**Finally**: Integrate into orchestrator CLI (Phase 3)

---

*Last updated: 2026-01-10*
*Author: Claude Code*
*Authority: IDSE Constitution Article I (Intentionality)*
