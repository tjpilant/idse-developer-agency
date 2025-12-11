# IDSE Governance Layer - Quick Start

**TL;DR:** Automated handoff and role change system for Claude ↔ Codex collaboration in VS Code.

---

## 🚀 How to Use

### 1. View Current State
```
Ctrl+Shift+P → "Tasks: Run Task" → "View IDSE State"
```

### 2. Hand Off to Another LLM

**Claude → Codex:**
```
Ctrl+Shift+P → "Tasks: Run Task" → "Handoff to Codex"
Enter reason: "Implementation complete, need review"
```

**Codex → Claude:**
```
Ctrl+Shift+P → "Tasks: Run Task" → "Handoff to Claude"
Enter reason: "Review complete, ready for refinement"
```

**Acknowledge Receipt:**
```
Ctrl+Shift+P → "Tasks: Run Task" → "Acknowledge Handoff"
```

### 3. Change Your Role

```
Ctrl+Shift+P → "Tasks: Run Task" → Select:
  - "Change Role to Builder"
  - "Change Role to Reviewer"
  - "Change Role to Planner"
  - "Change Role to Implementer"
```

### 4. Change IDSE Stage

```
Ctrl+Shift+P → "Tasks: Run Task" → "Change IDSE Stage"
Select from: Intent, Context, Specification, Plan, Tasks, Implementation, Feedback
```

---

## ⚙️ Behind the Scenes

**Files Updated Automatically:**
- `idse-governance/state/state.json` - Current state tracking
- `idse-governance/feedback/handoff_*.md` - Handoff documentation

**No Manual Editing Required!**

---

## 📝 Typical Workflow

**Example: Claude builds, Codex reviews**

1. **Claude** (builder role, Implementation stage):
   - Implements feature
   - Writes tests
   - Commits code
   - Runs: "Handoff to Codex" with reason "Feature complete, need review"

2. **User** switches IDE to Codex

3. **Codex** (automatically becomes reviewer):
   - Runs: "Acknowledge Handoff"
   - Reviews code
   - Documents findings in handoff document
   - Runs: "Handoff to Claude" with reason "Review complete, suggestions in feedback/"

4. **User** switches IDE back to Claude

5. **Claude**:
   - Runs: "Acknowledge Handoff"
   - Reads Codex's feedback
   - Makes refinements
   - Cycle continues...

---

## 🎯 Key Rules

1. **Only active LLM can work** - Check state first
2. **Always acknowledge handoffs** - Don't proceed until acknowledged
3. **Provide clear handoff reasons** - Help the next LLM understand context
4. **Use roles semantically** - Builder = implement, Reviewer = validate

---

## 🆘 Quick Troubleshooting

**"Not active LLM"** → Another LLM has control, wait for handoff

**"Awaiting handoff true"** → Run "Acknowledge Handoff"

**"State file error"** → Run "Validate IDSE Governance Layer"

---

## 📚 More Info

- **Full Guide:** [AUTOMATION.md](AUTOMATION.md)
- **Protocol Details:** [protocols/handoff_protocol.md](protocols/handoff_protocol.md)
- **Layer Overview:** [README.md](README.md)

---

**Get Started Now:**
```
Ctrl+Shift+P → "Tasks: Run Task" → "View IDSE State"
```

See your current role, stage, and who's in control!
