# Plan – IDSE_Core

Intent: intents/projects/IDSE_Core/sessions/session-1765806980/intent.md  
Context: contexts/projects/IDSE_Core/sessions/session-1765806980/context.md  
Spec: specs/projects/IDSE_Core/sessions/session-1765806980/spec.md  

## 1. Purpose of this Plan

This plan translates the IDSE_Core specification into a phased implementation strategy. It defines core components, epics, and phases so new contributors can understand how the engine will be built, how governance is integrated, and how determinism and root guardrails are enforced.

## 2. Architecture Overview

The IDSE_Core engine will consist of the following high-level components:

- **Artifact Manager** — Handles schema registration, serialization, and versioned storage.  
- **Pipeline Orchestrator** — Coordinates stage transitions, enforces canonical ordering, and invokes governance hooks at the appropriate points.  
- **Governance Adapter** — Loads `GovernanceIntegrationConfig`, invokes governance scripts, and parses results into validation/feedback artifacts with appropriate blocking behavior.  
- **CLI & MCP Interface Layer** — Provides human and machine control surfaces via local CLI commands and lightweight MCP endpoints for IDEs, CI, and other tools.  
- **Trace & Validation Subsystem** — Logs deterministic run traces and validation artifacts, enabling reproducibility, auditability, and clear visibility in IDEs and CI.

These components correspond to the artifact, orchestration, governance, interface, and tracing responsibilities defined in the specification.

## 3. Epics

Each epic corresponds to a major capability in the IDSE_Core lifecycle and can be developed, validated, and integrated independently under constitutional guardrails.

### Epic P1 – Schema + Storage Foundation

Establish the core artifact model and deterministic filesystem storage.

**Goals**

- Define and finalize schemas for all IDSE artifacts:
  - `intent`, `context`, `specification`, `plan`, `task`, `feedback`, `validationReport`.
- Implement an **Artifact Manager** that:
  - Registers schemas and enforces basic structural validation.
  - Reads/writes artifacts as Markdown/YAML under project/session-scoped paths.
  - Includes metadata such as `engineVersion`, artifact `version`, timestamps, and source paths.
- Ensure serialization is stable so that identical inputs and configuration produce byte-identical artifacts (excluding allowed metadata fields like timestamps).

**Key Deliverables**

- `ArtifactBase` plus concrete artifact models.
- Filesystem IO utilities respecting the current directory conventions.
- Initial unit tests for round-trip serialization and deterministic formatting.

---

### Epic P2 – Orchestrator Core (Local Runs)

Build the core **Pipeline Orchestrator** for local, single-process runs.

**Goals**

- Enforce canonical stage order:

  > `Intent → Context → Spec → Plan → Tasks → Implementation → Feedback`

- Validate that required upstream artifacts exist and pass structural checks before each stage.
- Provide a simple **stage/run state model** (e.g., `not_started | pending | complete | blocked | failed`) stored in a lightweight run-metadata artifact per project/session.
- Ensure that:
  - Downstream stages do **not** run when prerequisites are missing or invalid.
  - Orchestrator never mutates upstream artifacts when executing downstream stages.
  - Errors are structured and machine-readable.
  - Every orchestrator decision (advance or block) emits a structured event captured in the trace log so runs can be replayed deterministically.
- Couple orchestrator behavior explicitly to tests by defining clear contracts for ordering, blocking, and error semantics that map directly to the "Orchestrator & Ordering" and "Determinism" sections of the test plan.

**Key Deliverables**

- Orchestration engine with stage registry and prerequisite checks.
- Run-metadata artifact capturing stage states and last-executed run ID.
- Local driver to run up through at least `spec` and `plan` deterministically.
- Documented contracts (inputs, preconditions, expected states) referenced from the test plan so new tests can be added without reverse-engineering orchestrator behavior.

---

### Epic P3 – Governance Integration + Blocking

Establish a configurable, visible governance layer that can block unsafe progression.

**Goals**

- Define a `GovernanceIntegrationConfig` that declares:
  - Which governance tools run at which stages.
  - Blocking levels (e.g., `error` vs `warning`).
  - Timeouts, environment, and expected output formats.
- Implement a **Governance Adapter** that:
  - Loads `GovernanceIntegrationConfig`.
  - Invokes `validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py` via local CLI.
  - Parses outputs into `validationReport` (and, where appropriate, `feedback`) artifacts.
- Ensure governance results:
  - Are always recorded (no silent passes/failures).
  - Are surfaced through `status` (CLI and MCP) with clear reasons when a stage is blocked.
- Treat tool failures (timeouts, malformed output, missing executables) as **blocking errors** that prevent downstream stages until resolved.
- **Governance adapters must fail-fast deterministically**: given the same artifacts, configuration, and governance tool behavior, they must produce identical failures and validation artifacts on identical inputs.
- **Blocking behavior must be deterministic**: for the same inputs and governance outputs, the engine must make the same block/advance decision and emit identical validation artifacts.

**Key Deliverables**

- Governance config schema and loader.
- CLI invocation wrapper with timeout handling and structured parsing.
- ValidationReport and Feedback artifact creation logic.
- Status fields exposing governance findings and blocking reasons.

---

### Epic P4 – CLI + MCP Exposure

Expose IDSE_Core capabilities to humans and tools.

**Goals**

- Implement a **CLI** for local, human-driven workflows:
  - `idse-core status` — report project/session, current and next stage, artifacts, blockers.
  - `idse-core run-stage` — run a specific stage under ordering and governance rules.
  - `idse-core run-pipeline` — run multiple stages sequentially with an explicit confirmation flag.
- Implement a **lightweight MCP interface** (no persistent service required):
  - `status` tool (e.g., `/mcp/status`) — read-only, returns:
    - Project/session, current stage, next valid stage.
    - Artifact paths.
    - Governance and validation blockers.
  - `execute` tool (e.g., `/mcp/execute`) — side-effecting:
    - Executes one or more stages.
    - Enforces canonical ordering and governance blocking.
- Keep semantics consistent between CLI and MCP responses.
- Design CLI commands and MCP handlers so they can be exercised in automation and tests (without a long-lived service), mapping directly to the "CLI & MCP Interface Tests" section of the test plan.
- Ensure CLI and MCP responses conform to a shared JSON schema validated in automated test harnesses.

**Key Deliverables**

- CLI entry points mapped to orchestrator operations.
- MCP tool definitions and handler implementations.
- Shared response schemas for status and execute.
- Test harnesses or fixtures that invoke CLI/MCP interfaces programmatically to support automated regression and contract testing.

---

### Epic P5 – Determinism + Root Guardrail Validation

Guarantee deterministic behavior, tracing, and self-hosted guardrails.

**Goals**

- Implement the **Trace & Validation Subsystem**:
  - Per-run traces capturing stages executed, artifacts read/written, governance tools invoked, and outcomes.
  - Stable, normalized trace format suitable for hashing (excluding allowed volatile fields like timestamps).
- Enforce deterministic behavior:
  - Identical inputs/configuration produce identical artifacts and validation reports.
  - Introduce a "determinism harness" (e.g., a helper or CLI mode) to:
    - Run the same pipeline twice.
    - Compare artifacts and trace hashes.
- Implement the **Root Guardrail Self-Test**:
  - Run IDSE_Core against its own repository (docs + pipeline).
  - All constitutional guardrails must pass.
  - No `[REQUIRES INPUT]` markers remain for in-scope v1 behavior.
- Add **meta-validation** for the plan and test-plan:
  - Governance and validation tools run against IDSE_Core's own spec/plan/test-plan artifacts to ensure:
    - No unresolved `[REQUIRES INPUT]` in v1 scope.
    - Epics, phases, and milestones are internally consistent.
    - Determinism and governance-related NFRs have corresponding tests.

**Key Deliverables**

- Trace artifact schema and hashing logic.
- CLI or script to perform determinism checks (artifacts + trace hashes).
- Root Guardrail Self-Test scenario and automation.
- Meta-validation job or script for spec/plan/test-plan consistency.

## 4. Test Strategy Summary

Testing for IDSE_Core is defined in a dedicated test plan and is tightly coupled to the epics above. At a high level, tests focus on:

- **Schema & storage correctness** – validating artifact schemas, round-trip serialization, and filesystem path conventions.
- **Orchestrator behavior** – enforcing stage ordering, blocking rules, and structured error/trace emission.
- **Governance integration** – ensuring governance tools block or advance stages deterministically and always produce visible validation artifacts.
- **CLI & MCP contracts** – verifying that human and machine interfaces share a JSON response schema and behave consistently across CLI and MCP.
- **Determinism & root guardrails** – checking that repeated runs produce identical artifacts and traces, and that IDSE_Core can successfully run its own pipeline with no unresolved `[REQUIRES INPUT]` for in-scope v1 behavior.

Each epic will deliver its own test harness and validation artifacts. Governance adapters and deterministic behavior will be continuously verified via CI, using the determinism harness and root guardrail self-tests on changes to IDSE_Core, culminating in the Root Guardrail self-test in Phase 5. See `plans/projects/IDSE_Core/sessions/session-1765806980/test-plan.md` for detailed test cases aligned to each epic.

## 5. Milestones

Each milestone groups a set of epics into a coherent, shippable slice.

- **M1 – Schemas + IO Baseline (P1)**  
  - Artifact models defined and IO working with deterministic formatting.
- **M2 – Orchestrator Core (P2)**  
  - Pipeline Orchestrator can run local stages (through at least Spec/Plan) with enforced ordering.
- **M3 – Governance Integration (P3)**  
  - GovernanceAdapter wired with blocking behavior and surfaced findings.
- **M4 – Interfaces Exposed (P4)**  
  - CLI and MCP endpoints usable in local dev and basic IDE integration.
- **M5 – Determinism & Root Guardrail (P5)**  
  - Determinism harness, trace hashing, root guardrail self-test, and meta-validation green.

## 6. Phase Mapping

To clarify sequential execution and dependencies, milestones and epics are grouped into phases:

```markdown
Phase   | Epic | Focus
------- | ---- | ------------------------------------------
Phase 1 | P1   | Schema + Storage foundation
Phase 2 | P2   | Orchestrator core (local runs)
Phase 3 | P3   | Governance integration + blocking
Phase 4 | P4   | CLI + MCP exposure
Phase 5 | P5   | Determinism + Root Guardrail validation
```

This phase ordering reflects core dependencies: earlier phases establish schemas, IO, and orchestration that later phases extend with governance, interfaces, and guardrails. Later phases assume earlier ones are stable so they can lock in determinism, documentation, and self-hosting checks without reworking foundations.

## 7. Validation Mapping

This section maps IDSE_Core’s specification areas to their corresponding plan epics, test-plan sections, and task phases to support governance and CI validation.

| Spec Area                          | Plan Epic / Section                            | Test Plan Section                                      | Tasks Phase / Notes                           |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Core Data Model (ArtifactBase, …)  | Epic P1 – Schema + Storage Foundation          | §1 – Schema & Storage Tests                            | Phase 1 – Schema + Storage Foundation (P1)    |
| Orchestration Semantics            | Epic P2 – Orchestrator Core (Local Runs)       | §2 – Orchestrator & Ordering; §5 – Determinism Tests   | Phase 2 – Orchestrator Core (P2)             |
| Governance Integration & Blocking  | Epic P3 – Governance Integration + Blocking    | §3 – Governance Integration & Blocking Tests           | Phase 3 – Governance Integration (P3)        |
| Interfaces & MCP                   | Epic P4 – CLI + MCP Exposure                   | §4 – CLI & MCP Interface Tests                         | Phase 4 – CLI + MCP Exposure (P4)            |
| Determinism & Root Guardrails      | Epic P5 – Determinism + Root Guardrail         | §5 – Determinism; §6 – Root Guardrail & Meta-Validation | Phase 5 – Determinism + Root Guardrail (P5) |

Each task in `tasks.md` must map to at least one explicit acceptance test in `test-plan.md`, ensuring there are no orphan tasks without executable validation. Governance validators (`validate-artifacts.py`, `check-compliance.py`) must pass on every merge to `main`, enforcing that the implemented artifacts, plan, and tests remain aligned with the IDSE_Core specification and governance layer.
