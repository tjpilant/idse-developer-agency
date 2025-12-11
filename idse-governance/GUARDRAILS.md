# Governance Guardrails

**Version:** 1.1.0
**Last Updated:** 2025-12-11
**Status:** ✅ All guardrails active and tested

---

## Overview

The IDSE Governance Layer now enforces **active LLM verification** for all state-changing commands. This prevents unauthorized modifications to governance state.

---

## Guardrails in Place

### ✅ **Handoff Initiation**
- **Check:** Verifies `from_llm` matches `active_llm` in state
- **Error:** "Only the active LLM can initiate handoff"
- **Bypass:** None (enforced at code level)

### ✅ **Role Changes**
- **Check:** Verifies calling LLM matches `active_llm`
- **Error:** "Permission denied for command 'role change'"
- **Bypass:** Must use `--as` parameter matching active LLM

### ✅ **Stage Changes**
- **Check:** Verifies calling LLM matches `active_llm`
- **Error:** "Permission denied for command 'stage change'"
- **Bypass:** Must use `--as` parameter matching active LLM

### ✅ **Handoff Acknowledgment**
- **Check:** Verifies calling LLM matches `active_llm`
- **Error:** "Permission denied for command 'acknowledge'"
- **Bypass:** Must use `--as` parameter matching active LLM

### ℹ️  **View State**
- **Check:** None (read-only operation)
- **Available to:** Anyone

---

## How Guardrails Work

### CLI Usage

**All state-changing commands require `--as <llm_name>`:**

```bash
# Role change (REQUIRES --as)
python3 .cursor/tasks/governance.py role --as claude_code reviewer

# Stage change (REQUIRES --as)
python3 .cursor/tasks/governance.py stage --as claude_code Feedback

# Acknowledge handoff (REQUIRES --as)
python3 .cursor/tasks/governance.py acknowledge --as claude_code

# Handoff (already has from_llm, no --as needed)
python3 .cursor/tasks/governance.py handoff claude_code codex_gpt "reason"

# View state (NO GUARDRAIL - read-only)
python3 .cursor/tasks/governance.py view
```

### VS Code Tasks

**Tasks now prompt for LLM identity:**

When you run a governance task, you'll be asked:
```
Which LLM are you? (This verifies you're the active LLM)
  > claude_code
    codex_gpt
```

The task will fail if you select an LLM that doesn't match `active_llm` in state.

---

## Verification Function

**Location:** `.cursor/tasks/governance.py:75-91`

```python
def verify_active_llm(calling_llm: str, state: dict, command: str) -> None:
    """
    Verify that the calling LLM is the active LLM.
    Exits with error if not.
    """
    if calling_llm not in VALID_LLMS:
        print(f"❌ Invalid LLM identifier: {calling_llm}")
        print(f"   Valid: {VALID_LLMS}")
        sys.exit(1)

    if state["active_llm"] != calling_llm:
        print(f"❌ Permission denied for command '{command}'")
        print(f"   Active LLM: {state['active_llm']}")
        print(f"   Calling LLM: {calling_llm}")
        print(f"\n   Only the active LLM can execute governance commands.")
        print(f"   Wait for handoff or ask the active LLM to hand off control.")
        sys.exit(1)
```

**Called by:**
- `acknowledge_handoff(calling_llm)` - line 205
- `change_role(calling_llm, ...)` - line 236
- `change_stage(calling_llm, ...)` - line 284

---

## Test Results

### Test 1: Unauthorized Role Change
```bash
$ python3 .cursor/tasks/governance.py role --as codex_gpt builder "test"
❌ Permission denied for command 'role change'
   Active LLM: claude_code
   Calling LLM: codex_gpt

   Only the active LLM can execute governance commands.
   Wait for handoff or ask the active LLM to hand off control.
```
✅ **PASS** - Blocked unauthorized access

### Test 2: Authorized Role Change
```bash
$ python3 .cursor/tasks/governance.py role --as claude_code reviewer
✅ State updated: idse-governance/state/state.json

======================================================================
🔄 Role changed: builder → reviewer
======================================================================
LLM: claude_code
...
```
✅ **PASS** - Allowed authorized access

### Test 3: Unauthorized Stage Change
```bash
$ python3 .cursor/tasks/governance.py stage --as codex_gpt Feedback
❌ Permission denied for command 'stage change'
   Active LLM: claude_code
   Calling LLM: codex_gpt
```
✅ **PASS** - Blocked unauthorized access

### Test 4: Unauthorized Acknowledge
```bash
$ python3 .cursor/tasks/governance.py acknowledge --as codex_gpt
❌ Permission denied for command 'acknowledge'
   Active LLM: claude_code
   Calling LLM: codex_gpt
```
✅ **PASS** - Blocked unauthorized access

---

## Migration Notes

### Breaking Changes from v1.0.0

**Old CLI (v1.0.0):**
```bash
python3 governance.py role builder
python3 governance.py stage Feedback
python3 governance.py acknowledge
```

**New CLI (v1.1.0):**
```bash
python3 governance.py role --as claude_code builder
python3 governance.py stage --as claude_code Feedback
python3 governance.py acknowledge --as claude_code
```

### VS Code Tasks

**Automatic migration** - tasks now include `${input:whichLLM}` prompt.

No manual changes needed, but users will now be prompted to identify themselves.

---

## Philosophy

### Trust-Based Security

The governance system is **not designed to prevent malicious actors**. It's designed to:

1. **Prevent honest mistakes** - Remind LLMs which one is active
2. **Catch accidents** - Block unintentional state changes
3. **Provide clear feedback** - Explain why a command was blocked
4. **Maintain clarity** - Keep state synchronized with reality

### Honor System with Guardrails

**What we enforce:**
- ✅ Only active LLM can change state
- ✅ LLM identity must be declared
- ✅ Clear error messages on violations

**What we don't enforce:**
- ❌ Preventing lies about identity (you can claim to be any LLM)
- ❌ Cryptographic verification
- ❌ Multi-factor authentication
- ❌ Audit trails (only last action tracked)

**Why?** Because Claude and Codex are **cooperating collaborators**, not adversaries. The goal is helpful validation, not security hardening.

---

## Bypassing Guardrails (Not Recommended)

**If you really need to bypass guardrails:**

1. **Manual state.json edit** - Edit the state file directly
   ```bash
   vim idse-governance/state/state.json
   # Change "active_llm" field
   ```

2. **Lie about identity** - Claim to be the active LLM
   ```bash
   python3 governance.py role --as claude_code builder
   # Even if you're Codex
   ```

3. **Direct state manipulation** - Use Python to edit JSON
   ```python
   import json
   state = json.load(open("idse-governance/state/state.json"))
   state["active_llm"] = "codex_gpt"
   json.dump(state, open("idse-governance/state/state.json", "w"))
   ```

**Consequences:** State becomes out of sync with reality, leading to confusion and potential data loss.

**Recommendation:** Don't bypass. If you need to change active LLM, use the handoff protocol.

---

## Future Enhancements

### Considered but Not Implemented

1. **Automatic LLM detection** - Detect which LLM is running based on environment
   - **Why not:** No reliable way to distinguish Claude from Codex in VS Code

2. **Cryptographic signatures** - Sign state changes with LLM-specific keys
   - **Why not:** Overkill for cooperative collaboration

3. **Audit log** - Track all state changes in append-only log
   - **Why not:** Handoff documents serve this purpose

4. **State locking** - Prevent concurrent modifications
   - **Why not:** Single-user, single-IDE environment (no concurrency)

5. **Rollback capability** - Undo state changes
   - **Why not:** Handoff flow is forward-only by design

---

## Troubleshooting

### "Permission denied" when you ARE the active LLM

**Cause:** You selected the wrong LLM in the prompt

**Fix:** Run the task again and select the correct LLM from the dropdown

### State says Codex is active but you're using Claude

**Cause:** State out of sync (previous handoff not completed)

**Fix:** Run handoff to transfer control properly:
```bash
python3 .cursor/tasks/governance.py handoff codex_gpt claude_code "Syncing state"
python3 .cursor/tasks/governance.py acknowledge --as claude_code
```

### Forgot which LLM is active

**Check state:**
```bash
python3 .cursor/tasks/governance.py view
```

Look for `Active LLM:` line.

---

## References

- **Automation Guide:** [AUTOMATION.md](AUTOMATION.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Protocol:** [protocols/handoff_protocol.md](protocols/handoff_protocol.md)
- **Implementation:** `.cursor/tasks/governance.py`

---

**Last tested:** 2025-12-11
**Test status:** ✅ All guardrails passing
**Test cases:** 4/4 passed
