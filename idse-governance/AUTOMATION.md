# IDSE Governance Automation Guide

Complete guide for automated LLM handoffs and role changes in the IDSE Governance Layer.

---

## Quick Reference

### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")

**Handoffs:**
- **Handoff to Codex** - Transfer control from Claude to Codex
- **Handoff to Claude** - Transfer control from Codex to Claude
- **Acknowledge Handoff** - Confirm receipt of handoff

**Role Changes:**
- **Change Role to Builder** - Switch to implementation role
- **Change Role to Reviewer** - Switch to review/feedback role
- **Change Role to Planner** - Switch to architecture/planning role
- **Change Role to Implementer** - Switch to execution role

**Utilities:**
- **View IDSE State** - Display current governance state
- **Change IDSE Stage** - Move to different pipeline stage
- **Validate IDSE Governance Layer** - Run integrity checks
- **Enter IDSE Governance Mode** - Display governance rules

---

## Command-Line Usage

### Python Script: `.cursor/tasks/governance.py`

```bash
# View current state (no auth required)
python3 .cursor/tasks/governance.py view

# Execute handoff (auth built into from_llm parameter)
python3 .cursor/tasks/governance.py handoff <from_llm> <to_llm> <reason>

# Acknowledge handoff (REQUIRES --as parameter)
python3 .cursor/tasks/governance.py acknowledge --as <llm_name>

# Change role (REQUIRES --as parameter)
python3 .cursor/tasks/governance.py role --as <llm_name> <new_role> [reason]

# Change stage (REQUIRES --as parameter)
python3 .cursor/tasks/governance.py stage --as <llm_name> <new_stage>
```

**🔒 Guardrails:** All state-changing commands verify you're the active LLM. See [GUARDRAILS.md](GUARDRAILS.md) for details.

**Valid Values:**
- **LLMs:** `claude_code`, `codex_gpt`
- **Roles:** `builder`, `reviewer`, `planner`, `implementer`
- **Stages:** `Intent`, `Context`, `Specification`, `Plan`, `Tasks`, `Implementation`, `Feedback`

---

## Handoff Workflow

### Scenario: Claude hands off to Codex for review

**Step 1: Claude initiates handoff**
```bash
# Via VS Code Task
Ctrl+Shift+P → "Tasks: Run Task" → "Handoff to Codex"
Enter reason: "Implementation complete, need architectural review"

# Or via CLI
python3 .cursor/tasks/governance.py handoff claude_code codex_gpt \
  "Implementation complete, need architectural review"
```

**What happens:**
- ✅ Creates handoff document: `idse-governance/feedback/handoff_claude_to_codex_<cycle_id>.md`
- ✅ Updates `state.json`:
  - `active_llm` → `codex_gpt`
  - `awaiting_handoff` → `true`
  - New `handoff_cycle_id` generated
  - `last_handoff` recorded
- ✅ Displays next steps

**Step 2: User switches IDE to Codex**

**Step 3: Codex acknowledges handoff**
```bash
# Via VS Code Task
Ctrl+Shift+P → "Tasks: Run Task" → "Acknowledge Handoff"

# Or via CLI
python3 .cursor/tasks/governance.py acknowledge
```

**What happens:**
- ✅ Sets `awaiting_handoff` → `false`
- ✅ Updates `last_checked` timestamp
- ✅ Codex can now proceed with work

**Step 4: Codex completes work and hands back to Claude**
```bash
Ctrl+Shift+P → "Tasks: Run Task" → "Handoff to Claude"
Enter reason: "Review complete, suggestions documented in feedback/"
```

---

## Role Change Workflow

### Scenario: Builder needs to switch to Reviewer role

**Option 1: VS Code Task (Recommended)**
```bash
Ctrl+Shift+P → "Tasks: Run Task" → "Change Role to Reviewer"
Enter reason: "Switching to review architectural changes"
```

**Option 2: CLI**
```bash
python3 .cursor/tasks/governance.py role reviewer \
  "Switching to review architectural changes"
```

**What happens:**
- ✅ Updates `role_change_event` in `state.json`
- ✅ Records transition: `builder` → `reviewer`
- ✅ Includes IDSE constitutional reference (Article IX - Feedback Incorporation)
- ✅ Updates `last_checked` timestamp

**Auto-generated reasons by role:**
- **builder:** Article VII – Plan Before Build
- **reviewer:** Article IX – Feedback Incorporation
- **planner:** Article IV – Specification Integrity
- **implementer:** Article VIII – Implementation Discipline

---

## Stage Change Workflow

### Scenario: Moving from Implementation to Feedback stage

**Via VS Code Task:**
```bash
Ctrl+Shift+P → "Tasks: Run Task" → "Change IDSE Stage"
Select: Feedback
```

**Via CLI:**
```bash
python3 .cursor/tasks/governance.py stage Feedback
```

**What happens:**
- ✅ Updates `active_stage` in `state.json`
- ✅ Updates `last_checked` timestamp

---

## State File Structure

**Location:** `idse-governance/state/state.json`

```json
{
  "active_llm": "claude_code",           // Current IDE agent in control
  "awaiting_handoff": false,              // Handoff in progress?
  "handoff_cycle_id": "2025-12-11T...",  // Current handoff cycle
  "layer_scope": "governance",            // Always "governance"
  "enforced_paths": ["idse-governance/"], // Protected paths

  "role_change_event": {                  // Current role
    "from": "builder",
    "to": "reviewer",
    "reason": "...",
    "timestamp": "..."
  },

  "active_stage": "Implementation",       // Current IDSE stage

  "last_handoff": {                       // Last handoff info
    "from": "claude_code",
    "to": "codex_gpt",
    "timestamp": "...",
    "notes": "..."
  },

  "last_checked": "..."                   // Last state update
}
```

---

## Handoff Document Structure

**Location:** `idse-governance/feedback/handoff_<direction>_<cycle_id>.md`

**Template fields (auto-populated):**
- `{{handoff_cycle_id}}` - Current cycle ID
- `{{timestamp}}` - Handoff timestamp
- `{{active_stage}}` - Current IDSE stage

**Sections to fill:**
- **Summary of Work** - What was completed
- **Issues / Risks** - Blockers, risks, unknowns
- **Requests / Next Actions** - What receiving LLM should do
- **Validation** - Tests run and results

---

## Guardrails & Validation

### State Read Guard

Both LLMs check state before working:

```python
state = load_state()

# Check 1: Am I the active LLM?
if state["active_llm"] != "claude_code":  # or codex_gpt
    print("❌ Not active LLM, cannot proceed")
    exit()

# Check 2: Is handoff awaiting acknowledgment?
if state["awaiting_handoff"]:
    print("⚠️ Handoff in progress, acknowledge first")
    exit()
```

### Atomic State Updates

The governance script writes atomically:
1. Write to temporary file: `state.json.tmp`
2. Validate schema
3. Atomic rename: `state.json.tmp` → `state.json`

This prevents corruption if script is interrupted.

### Schema Validation

Required fields checked on every save:
- `active_llm` (must be valid LLM)
- `awaiting_handoff` (boolean)
- `handoff_cycle_id` (string)
- `layer_scope` (must be "governance")

---

## Error Handling

### Common Errors

**"Not active LLM, cannot proceed"**
- Another LLM is currently active
- Check state: `python3 .cursor/tasks/governance.py view`
- Wait for handoff or ask other LLM to hand off

**"Cannot handoff to same LLM"**
- Use role change instead: `python3 .cursor/tasks/governance.py role <new_role>`

**"awaiting_handoff is already true"**
- Previous handoff not acknowledged
- Run: `python3 .cursor/tasks/governance.py acknowledge`

**"State file not found"**
- Governance layer not properly initialized
- Verify: `ls idse-governance/state/state.json`

---

## Integration with IDSE Pipeline

The governance automation integrates with IDSE stages:

| Stage | Typical Role | Typical Handoff Pattern |
|-------|--------------|------------------------|
| Intent | Planner | Claude (define) → Codex (review) |
| Context | Builder | Claude (research) → Codex (validate) |
| Specification | Planner | Claude (draft) → Codex (verify) |
| Plan | Planner | Claude (design) → Codex (review) |
| Tasks | Builder | Claude (break down) → Codex (validate) |
| Implementation | Implementer | Claude (build) → Codex (test) |
| Feedback | Reviewer | Codex (review) → Claude (refine) |

---

## Best Practices

### When to Handoff

✅ **Do handoff when:**
- Completing a major milestone (e.g., implementation done)
- Need different expertise (e.g., architecture review)
- Reached natural stopping point
- Uncertain about approach and need validation

❌ **Don't handoff when:**
- In middle of implementation
- Just started a task
- Simple clarification needed (ask user instead)

### When to Change Role

✅ **Do change role when:**
- Shifting from building to reviewing own work
- Moving between IDSE stages (Plan → Implementation)
- Context changes (bug fix → feature development)

❌ **Don't change role when:**
- Already in correct role
- Change is unnecessary (roles are semantic, not strict)

### Handoff Document Quality

**Good handoff notes:**
- ✅ Specific: "Implemented file write tools, tested with 5 scenarios"
- ✅ Actionable: "Please review error handling in WriteFileTool.py:42-58"
- ✅ Linked: "See implementation/current/README.md for details"

**Bad handoff notes:**
- ❌ Vague: "Did some work"
- ❌ No context: "Check the code"
- ❌ No next steps: "Everything's done"

---

## Troubleshooting

### View Full State
```bash
cat idse-governance/state/state.json | python3 -m json.tool
```

### Reset Awaiting Handoff (Emergency)
```bash
# Manually edit state.json
vim idse-governance/state/state.json
# Set: "awaiting_handoff": false
```

### Validate Governance Layer
```bash
bash .cursor/tasks/validate-idse-layer.sh
```

### Check Last Handoff
```bash
python3 .cursor/tasks/governance.py view | grep "Last Handoff"
```

---

## Files & Locations

```
idse-governance/
├── state/
│   └── state.json                    # Current state (DO NOT EDIT MANUALLY)
├── feedback/
│   └── handoff_*_*.md                # Generated handoff documents
├── templates/
│   └── handoff_templates/
│       ├── claude_to_codex_template.md
│       └── codex_to_claude_template.md
└── protocols/
    └── handoff_protocol.md           # Full protocol specification

.cursor/tasks/
├── governance.py                     # Automation script
└── validate-idse-layer.sh            # Validation script

.vscode/
└── tasks.json                        # VS Code task definitions
```

---

## Next Steps

1. **Practice a handoff:** Try "Handoff to Codex" and "Acknowledge Handoff"
2. **Test role changes:** Switch between builder and reviewer
3. **Review handoff documents:** Check `idse-governance/feedback/`
4. **Monitor state:** Use "View IDSE State" regularly

---

## References

- **Protocol:** [idse-governance/protocols/handoff_protocol.md](protocols/handoff_protocol.md)
- **Layer Overview:** [idse-governance/README.md](README.md)
- **Architectural Fix:** [idse-governance/feedback/architectural_fix_2025-12-11.md](feedback/architectural_fix_2025-12-11.md)
- **IDSE Constitution:** `docs/02-idse-constitution.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-12-11
**Author:** Claude (claude_code)
