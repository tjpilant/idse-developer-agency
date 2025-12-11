# Dual-LLM Handoff & Role Redefinition Protocol  
**Applies to:** Claude ↔ Codex collaboration inside the IDSE-governed Agency Builder environment (IDE use only, not intra-agency routing)  
**Version:** 1.0.0  
**Last Updated:** 2025-12-11  
**Author:** IDSE Developer Agent  

---

## 1️⃣ Intent  
Enable two cooperating LLMs (Claude and Codex) to build, review, and refine Agency Swarm projects under the **Intent-Driven Systems Engineering (IDSE)** framework, with:  
- Explicit, logged handoffs (`Claude → Codex` and `Codex → Claude`)  
- State tracking via `docs/state.json`  
- Controlled role redefinition when scope or stage changes  

---

## 2️⃣ Context  
- **Environment:** VS Code IDE + Cursor rules + IDSE docs  
- **Agents:** Claude (`claude_code`), Codex (`codex_gpt`)  
- **State File:** `docs/state.json` tracks `active_llm`, `awaiting_handoff`, `role_change_event`, `handoff_cycle_id`, `active_stage`.  
- **Templates:**  
  - `docs/protocols/handoff_templates/claude_to_codex_template.md`  
  - `docs/protocols/handoff_templates/codex_to_claude_template.md`  

---

## 3️⃣ Specification  

### Functional Requirements  
1. Exactly one LLM is active (`active_llm`).  
2. Handoffs toggle `awaiting_handoff`.  
3. Every handoff → template + state update + timestamp.  
4. Role change events → JSON entry with justification linked to an IDSE article.  
5. State read guard: an LLM must halt if `awaiting_handoff=true` or it is not `active_llm`.  
6. All templates must cite current IDSE stage and PLAN path.  

### Non-Functional Requirements  
- Human-readable diff logs (< 200 lines).  
- Round-trip handoff < 5 min.  
- JSON schema validation must pass.  

---

## 4️⃣ Plan  

### Architecture Flow  
```
Claude (Build / Implementation)
↓  handoff_template + state.json update
Codex (Review / Feedback)
↓  findings → handoff_template + state.json update
Claude (Refine / Plan Update)

```

### Key Artifacts  
| Artifact | Purpose | Owner | Stage |  
|-----------|----------|-------|--------|  
| `handoff_protocol.md` | Defines rules and state schema | IDSE Developer Agent | Spec → Plan |  
| `handoff_templates/*.md` | Standard handoff messages | Claude/Codex | Tasks → Impl |  
| `docs/state.json` | Shared session register | Both | All |  
| `AGENTS.md` | Describes dynamic roles | Claude | Plan |  

---

## 5️⃣ Tasks  

| # | Task | Output | Responsible | Stage |  
|----|-------|---------|--------------|---------|  
| 1 | Extend `docs/state.json` schema with `handoff_cycle_id`, `role_change_event`, `active_stage` | Updated schema | Codex | Tasks |  
| 2 | Add `handoff_protocol.md` to repo | This file | Claude | Implementation |  
| 3 | Update `AGENTS.md` with dynamic Claude/Codex roles | Revised file | Claude | Implementation |  
| 4 | Ensure handoff templates cite current IDSE stage and PLAN path | Validated templates | Codex | QA |  
| 5 | Run `grep -R "REQUIRES INPUT"` check | Clean validation | Claude | Feedback |  

---

## 6️⃣ Implementation Notes  

### State File Schema Example
```json
{
  "active_llm": "claude_code",
  "awaiting_handoff": false,
  "handoff_cycle_id": "2025-12-11T20:01Z",
  "role_change_event": null,
  "active_stage": "Implementation",
  "last_handoff": {
    "from": "claude_code",
    "to": "codex_gpt",
    "timestamp": "2025-12-11T20:00Z",
    "notes": "Completed Implementation tasks per plan v1.2"
  }
}
```

### Role Change Event Example

```json
"role_change_event": {
  "from": "reviewer",
  "to": "planner",
  "reason": "Scope change detected (Article IX – Feedback Incorporation)",
  "timestamp": "2025-12-11T20:05Z"
}
```

### Guardrails

* Do not edit code if `awaiting_handoff=true`.
* Role changes require mutual acknowledgment.
* Record cycle time for each handoff → Feedback metrics.

---

## 7️⃣ Feedback Loop

Each handoff round produces a `feedback/current/handoff_<cycle_id>.md` summary including:

* Build / Review outcomes
* Discovered issues & mitigations
* Role changes (if any)
* Duration and handoff quality notes

Metrics feed into `feedback/current/feedback.md` for continuous governance refinement.

---

## 8️⃣ Governance References

* **IDSE Constitution** – `docs/02-idse-constitution.md`
* **Pipeline** – `docs/03-idse-pipeline.md`
* **Agency Swarm SOP** – `docs/idse-agency-swarm-sop.md`
* **AGENTS Roles** – `AGENTS.md`
* **State Register** – `docs/state.json`

---

## ✅ Outcome

With this protocol in place:

* Handoffs become first-class IDSE artifacts.
* Each LLM operates with traceable roles and authority.
* Role redefinition is governed by context and constitution.
* Feedback loops close formally, maintaining a living governance system.

```
