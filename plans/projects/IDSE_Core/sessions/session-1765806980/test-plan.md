# Test Plan – IDSE_Core

Intent: intents/projects/IDSE_Core/sessions/session-1765806980/intent.md  
Context: contexts/projects/IDSE_Core/sessions/session-1765806980/context.md  
Spec: specs/projects/IDSE_Core/sessions/session-1765806980/spec.md  
Plan: plans/projects/IDSE_Core/sessions/session-1765806980/plan.md

This test plan defines how we validate IDSE_Core's core behaviors: artifact correctness, pipeline ordering, governance blocking, determinism, and root guardrail self-hosting. It is the executable counterpart to the Plan's **Test Strategy Summary**: sections 1–6 map to epics P1–P5 and turn their contracts into concrete, automatable checks.

## 1. Schema & Storage Tests (P1)

- **Artifact serialization/round-trip**
  - Create artifacts of each kind (`intent`, `context`, `specification`, `plan`, `task`, `feedback`, `validationReport`).
  - Serialize to Markdown/YAML and deserialize.
  - Verify structural equality and required metadata fields (IDs, engineVersion, version, timestamps).

- **Path conventions**
  - For a given project/session, verify artifacts are written to:
    - `intents/projects/<project>/sessions/<session>/...`
    - `contexts/projects/<project>/sessions/<session>/...`
    - etc.
  - Confirm no writes occur outside project/session-scoped paths.

## 2. Orchestrator & Ordering Tests (P2)

- **Missing Context blocks Spec/Plan**
  - Given a valid `intent.md` but no `context.md`, attempts to run `spec` or `plan`:
    - Must not write `spec.md` or `plan.md`.
    - Must mark the stage as `blocked` with a clear reason.

- **Invalid Spec blocks Plan**
  - Introduce a structural violation in `spec.md` (e.g., missing required field).
  - Attempt to run `plan`.
  - Expect:
    - No `plan.md` written/updated.
    - Structured error and `blocked` or `failed` state with explanation.

- **No partial downstream artifacts on failure**
  - Simulate a stage failure (tool error or validation error).
  - Confirm no partial downstream artifacts are created for that stage.

- **Trace event emission**
  - For each stage run (whether it advances or is blocked), verify that the trace log contains a corresponding structured event capturing at least the stage, decision (`advance`/`block`), and reason. Repeat the same run twice with identical inputs/configuration and confirm the sequence and content of these events are identical aside from allowed metadata such as timestamps.

## 3. Governance Integration & Blocking Tests (P3)

- **Happy path governance pass**
  - With governance tools present and passing:
    - Run a stage that triggers governance (e.g., Spec → Plan).
    - Confirm:
      - ValidationReport artifacts created with `passed = true` and no `error` findings.
      - Stage advances normally.

- **Blocking on governance errors**
  - Configure a deliberate governance failure (e.g., spec violating a constitutional rule).
  - Run the affected stage.
  - Confirm:
    - Stage is `blocked`, no downstream artifacts written.
    - At least one ValidationReport with `passed = false` and `error` findings exists.
    - CLI and MCP `status` surfaces the blocking reason.

- **Tool failure as blocking**
  - Break governance configuration (missing executable, timeout).
  - Run a stage that triggers governance.
  - Confirm:
    - Stage is blocked with a clear error.
    - No downstream artifacts written.
    - ValidationReport or Feedback artifact indicates tool failure.

- **Governance determinism**
  - Introduce a controlled governance failure (e.g., known spec violation).
  - Run the same stage twice with identical inputs and configuration.
  - Verify that governance adapters fail-fast in the same way, with identical validation artifacts and blocking decisions for identical inputs.

## 4. CLI & MCP Interface Tests (P4)

- **Status contract**
  - From CLI (`idse-core status`) and MCP (`/mcp/status`), verify:
    - Project/session.
    - Current stage and next valid stage.
    - Paths to existing artifacts.
    - Any governance/validation blockers.
  - Ensure CLI and MCP responses are consistent.

- **Execute contract**
  - From CLI and MCP (`/mcp/execute`):
    - Attempt single-stage and multi-stage runs.
    - Verify:
      - Canonical ordering is enforced.
      - Stages beyond the first failure/block are not executed.
      - Responses list stages attempted, outcomes, and blockers.

- **Shared JSON schema validation**
  - Using automated test harnesses, invoke CLI commands (in JSON output mode) and MCP endpoints for `status` and `execute`. Validate all responses against a shared JSON schema so that interface contracts remain consistent across human and machine entry points and regressions are caught automatically.

## 5. Determinism Tests (P5)

- **Pipeline repeatability**
  - Run the same pipeline twice with identical inputs and configuration.
  - Verify that all generated artifacts and validation reports are byte-identical (excluding allowed metadata like timestamps or run IDs).

- **Change sensitivity**
  - Modify a single upstream artifact field (e.g., one Intent objective).
  - Re-run the pipeline for affected stages.
  - Confirm that only expected downstream artifacts change.

- **Trace hash consistency**
  - For identical pipeline runs, compute a stable hash over the normalized trace (excluding allowed volatile fields like timestamps).
  - Compare run-trace hashes between runs, and treat any mismatched hashes as a signal of nondeterministic behavior that must be investigated.

## 6. Root Guardrail & Meta-Validation Tests (P5)

- **Root Guardrail Self-Test**
  - Run IDSE_Core against its own repository (docs + pipeline).
  - All constitutional guardrails must pass, and no `[REQUIRES INPUT]` markers remain for in-scope v1 behavior.

- **Plan/test-plan self-consistency check**
  - Run governance and validation tools against the IDSE_Core spec, plan, and test-plan artifacts themselves to ensure:
    - No unresolved `[REQUIRES INPUT]` markers remain for in-scope v1 behavior.
    - Phase, epic, and milestone mappings are internally consistent (no orphaned or dangling references).
    - All determinism and governance-related NFRs have at least one corresponding test case.
  - Treat any governance findings or inconsistencies as blockers that must be resolved before shipping IDSE_Core v1.

- **CI integration**
  - Wire the Root Guardrail Self-Test, determinism tests, and core governance-blocking scenarios into CI so that any failures in these suites block merges or releases of IDSE_Core.

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
