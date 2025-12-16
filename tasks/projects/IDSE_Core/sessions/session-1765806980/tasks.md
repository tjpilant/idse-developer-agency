# Tasks – IDSE_Core

Source plan: plans/projects/IDSE_Core/sessions/session-1765806980/plan.md  
Source test plan: plans/projects/IDSE_Core/sessions/session-1765806980/test-plan.md

Notation: `[P]` = safe to execute in parallel with other `[P]` tasks once dependencies are satisfied.

Owners are placeholders and can be refined per team.

---

**Traceability Note:** Each phase includes a traceability header linking tasks back to the relevant spec, plan, and test-plan sections so governance and CI tooling can audit coverage automatically.

## Phase 1 – Schema + Storage Foundation (Epic P1)

**Traceability:** Spec – Core Data Model; Plan – Epic P1; Test Plan – Section 1 (Schema & Storage Tests)  
_Covers Spec Sections: ArtifactBase, Artifact Schemas, Storage IO_  
_Test Plan Reference: Section 1 – Schema & Storage Tests_

### 1.1 Artifact model design & base types
- [ ] **Task 1.1.1 – Define ArtifactBase and core enums** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** None
  - **Description:** Design the `ArtifactBase` type and related enums (artifact kinds, status), matching the spec’s core data model section.
  - **Acceptance:** Types cover all required common fields (id, projectId, sessionId, kind, engineVersion, version, status, timestamps, sourcePath, metadata) and compile with no lints.

- [ ] **Task 1.1.2 – Define concrete artifact models (Intent, Context, Spec, Plan, Task, Feedback, ValidationReport)**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.1.1
  - **Description:** Implement concrete models for each artifact type as per spec, including nested structures (user stories, requirements, validation findings, etc.).
  - **Acceptance:** All models match the spec fields and pass basic serialization tests (e.g., construction, to_dict/to_yaml without error).

### 1.2 Filesystem path conventions & IO
- [ ] **Task 1.2.1 – Implement project/session path builder** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.1.1
  - **Description:** Implement a small utility to resolve project/session-scoped paths for each artifact kind, matching the existing directory layout.
  - **Acceptance:** Given a projectId, sessionId, and artifact kind, returned paths match the conventions used in existing artifacts (intents/, contexts/, specs/, plans/, tasks/, etc.).

- [ ] **Task 1.2.2 – Implement Artifact Manager read/write API**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 1.1.1, 1.1.2, 1.2.1
  - **Description:** Implement load/save functions that read/write artifacts as Markdown/YAML, enriching them with metadata (engineVersion, version, timestamps, sourcePath).
  - **Acceptance:** Round-trip tests (see Task 1.3.1) pass for all artifact kinds; IO never writes outside project/session-scoped paths.

### 1.3 Deterministic serialization tests
- [ ] **Task 1.3.1 – Round-trip & determinism tests for artifact IO** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.2.2
  - **Description:** Add tests that serialize and deserialize artifacts and compare results, verifying structural equality and stable formatting.
  - **Acceptance:** Tests show that repeated serializations with identical inputs produce byte-identical outputs (excluding allowed metadata like timestamps).

---

## Phase 2 – Orchestrator Core (Epic P2)

**Traceability:** Spec – Orchestration Semantics; Plan – Epic P2; Test Plan – Sections 2 (Orchestrator & Ordering) and 5 (Determinism Tests)

### 2.1 Stage model & run metadata
- [ ] **Task 2.1.1 – Define stage enumeration and prerequisite mapping** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.1.1
  - **Description:** Define an enum or similar construct for pipeline stages and a mapping of each stage to its prerequisites.
  - **Acceptance:** Mapping enforces `Intent → Context → Spec → Plan → Tasks → Implementation → Feedback` and is covered by a small unit test.

- [ ] **Task 2.1.2 – Implement run-metadata artifact for stage state**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 2.1.1
  - **Description:** Implement a run-metadata structure recording stage status (`not_started | pending | complete | blocked | failed`) and last run ID per project/session.
  - **Acceptance:** Run-metadata can be created, updated, and persisted via the Artifact Manager; basic tests confirm state transitions are captured correctly.

### 2.2 Orchestration engine core
- [ ] **Task 2.2.1 – Implement orchestrator API for single-stage execution** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 1.2.2, 2.1.1, 2.1.2
  - **Description:** Implement a function/class that executes exactly one stage, enforcing prerequisites and returning a structured result (success/failure, reasons, artifacts touched).
  - **Acceptance:** Unit tests cover success and failure paths; downstream stages are not executed when prerequisites are missing or invalid.

- [ ] **Task 2.2.2 – Implement multi-stage run with ordering enforcement** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 2.2.1
  - **Description:** Allow the orchestrator to run from a start stage to an end stage sequentially, stopping at first failure/block.
  - **Acceptance:** Tests simulate multi-stage runs and confirm stages after the first failure are skipped and correctly marked in run-metadata.

### 2.3 Trace events for decisions
- [ ] **Task 2.3.1 – Design trace event schema for advance/block decisions** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 2.1.1
  - **Description:** Define the minimal structured event format to log every orchestrator decision (stage, decision, reason, related artifacts).
  - **Acceptance:** Schema aligns with the Trace & Validation Subsystem requirements and can be serialized deterministically.

- [ ] **Task 2.3.2 – Emit trace events from orchestrator core**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.1, 2.3.1
  - **Description:** Integrate trace event emission into all orchestrator decision points (advance/block), writing events to a trace log file per run.
  - **Acceptance:** Tests confirm that every stage run generates a corresponding event and that repeated runs with identical inputs yield identical event sequences (excluding timestamps).

---

## Phase 3 – Governance Integration + Blocking (Epic P3)

**Traceability:** Spec – Governance Integration & Blocking; Plan – Epic P3; Test Plan – Section 3 (Governance Integration & Blocking Tests)

### 3.1 Governance configuration
- [ ] **Task 3.1.1 – Implement GovernanceIntegrationConfig model** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.1.1
  - **Description:** Implement configuration structures for governance tools, including stages, inputTypes, outputKind, blockingLevels, and timeouts.
  - **Acceptance:** Config objects can be loaded from a file (YAML/JSON) and validated; invalid configs produce clear errors.

### 3.2 Governance Adapter implementation
- [ ] **Task 3.2.1 – Implement CLI invocation wrapper for governance tools**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 3.1.1
  - **Description:** Implement a wrapper to invoke `validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py` via CLI with timeouts and controlled environment.
  - **Acceptance:** Tests simulate successful and failing invocations; timeouts and missing executables yield structured error results.

- [ ] **Task 3.2.2 – Parse governance outputs into ValidationReport/Feedback artifacts**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 1.1.2, 1.2.2, 3.2.1
  - **Description:** Implement parsing of governance tool outputs into ValidationReport and Feedback artifacts, storing them via the Artifact Manager.
  - **Acceptance:** Tests confirm that governance findings appear as structured artifacts and are linkable to target artifacts and stages.

### 3.3 Deterministic blocking integration
- [ ] **Task 3.3.1 – Integrate governance results into orchestrator blocking logic**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.1, 3.2.2
  - **Description:** Wire governance results into the orchestrator so that configured blocking levels prevent stage advancement, updating run-metadata and trace events.
  - **Acceptance:** Orchestrator tests confirm that governance errors block progression and that behavior is deterministic for identical inputs.

- [ ] **Task 3.3.2 – Add governance determinism tests** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 3.3.1
  - **Description:** Implement tests that run the same governance-failing scenario twice and assert identical ValidationReport artifacts and blocking decisions.
  - **Acceptance:** Tests pass and fail reliably when governance outputs or config are changed.

### 3.4 Governance sync & drift detection
- [ ] **Task 3.4.1 – Governance Sync Task** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 3.1.1, 3.2.2
  - **Description:** Implement a script or utility that cross-checks `GovernanceIntegrationConfig` and governance-related behavior in IDSE_Core against the authoritative governance layer (e.g., `idse-governance/` docs/scripts) to detect schema or configuration drift.
  - **Acceptance:** Running the task produces a clear report of any mismatches (missing tools, unexpected stages, config fields not present in docs) and returns a failing status when drift is detected; wired into CI as an informational or blocking check according to governance policy. Add governance schema sync task to detect schema drift between IDSE_Core spec and governance layer. [P]

---

## Phase 4 – CLI + MCP Exposure (Epic P4)

**Traceability:** Spec – Interfaces & MCP; Plan – Epic P4; Test Plan – Section 4 (CLI & MCP Interface Tests)

### 4.1 CLI implementation
- [ ] **Task 4.1.1 – Implement `idse-core status` command** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 1.2.2, 2.1.2, 3.2.2
  - **Description:** Implement a CLI entry point to report project/session, current stage, next valid stage, artifact paths, and blockers.
  - **Acceptance:** CLI output matches the shared JSON schema when run in JSON mode and aligns with orchestrator and governance state.

- [ ] **Task 4.1.2 – Implement `idse-core run-stage` and `run-pipeline` commands**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.2, 3.3.1
  - **Description:** Implement commands to execute a single stage or a range of stages, enforcing confirmation for multi-stage runs.
  - **Acceptance:** Commands respect canonical ordering, stop on first failure/block, and return appropriate exit codes and JSON results.

### 4.2 MCP tools
- [ ] **Task 4.2.1 – Define MCP tool schemas for `status` and `execute`** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 4.1.1
  - **Description:** Define MCP tool definitions and JSON schemas for `status` and `execute` responses, shared with CLI JSON output.
  - **Acceptance:** Schemas are documented and reused across CLI and MCP; basic validation tests pass.

- [ ] **Task 4.2.2 – Implement MCP handlers for `status` and `execute`**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.2, 3.3.1, 4.2.1
  - **Description:** Implement MCP handlers that call orchestrator operations and return responses conforming to the shared JSON schema.
  - **Acceptance:** Automated tests invoke MCP handlers and validate responses against the schema; behavior matches CLI semantics.

### 4.3 Interface test harnesses
- [ ] **Task 4.3.1 – Build automated harness for CLI JSON responses** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 4.1.1, 4.1.2, 4.2.1
  - **Description:** Implement a test harness that calls CLI commands programmatically, captures JSON output, and validates it against the shared schema.
  - **Acceptance:** Harness is used by CLI & MCP Interface Tests; regressions in schema or behavior are detected in CI.

- [ ] **Task 4.3.2 – Build automated harness for MCP responses** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 4.2.2, 4.3.1
  - **Description:** Implement a test harness that invokes MCP tools and validates responses against shared schemas.
  - **Acceptance:** MCP interface regressions (schema or behavior) are caught reliably in CI.

---

## Phase 5 – Determinism + Root Guardrail (Epic P5)

**Traceability:** Spec – Determinism & Root Guardrails; Plan – Epic P5; Test Plan – Sections 5–6 (Determinism, Root Guardrail & Meta-Validation)

### 5.1 Trace & Validation Subsystem
- [ ] **Task 5.1.1 – Implement trace artifact format and writer** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.3.1, 2.3.2
  - **Description:** Implement the trace artifact structure and writer that aggregates per-stage events, governance calls, and outcomes.
  - **Acceptance:** Trace artifacts can be written and read deterministically; they include sufficient detail to reconstruct runs.

- [ ] **Task 5.1.2 – Implement normalized trace hashing**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 5.1.1
  - **Description:** Implement a function to normalize traces (excluding volatile fields) and compute stable hashes for determinism tests.
  - **Acceptance:** Identical runs produce identical trace hashes; differing runs produce differing hashes.

### 5.2 Determinism harness & tests
- [ ] **Task 5.2.1 – Implement determinism harness utility** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.2, 5.1.2
  - **Description:** Implement a utility/CLI mode that runs a given pipeline twice and compares artifacts and trace hashes.
  - **Acceptance:** Harness is used in Determinism Tests; failures clearly indicate which artifacts or hashes differ.

- [ ] **Task 5.2.2 – Wire determinism tests into CI**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 5.2.1
  - **Description:** Add CI jobs that run determinism tests on representative pipelines.
  - **Acceptance:** Any determinism regression fails CI.

### 5.3 Root Guardrail & Meta-Validation
- [ ] **Task 5.3.1 – Implement Root Guardrail Self-Test scenario**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 2.2.2, 3.3.1, 4.1.2, 5.2.1
  - **Description:** Script a scenario that runs IDSE_Core against its own repository (docs + pipeline) from Intent through Feedback, invoking governance checks.
  - **Acceptance:** Scenario completes with all constitutional guardrails passing and no `[REQUIRES INPUT]` markers for in-scope v1.

- [ ] **Task 5.3.2 – Implement plan/test-plan self-consistency validator** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 1.1.2
  - **Description:** Implement a validator that checks IDSE_Core's spec, plan, and test-plan for unresolved `[REQUIRES INPUT]`, orphaned epics/milestones, and missing tests for determinism/governance NFRs.
  - **Acceptance:** Validator runs as part of CI and blocks merges when inconsistencies are found.

- [ ] **Task 5.3.3 – Wire Root Guardrail and meta-validation into CI gates**
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 5.3.1, 5.3.2
  - **Description:** Integrate Root Guardrail Self-Test and plan/test-plan consistency checks into CI as mandatory gates.
  - **Acceptance:** Any failure in root guardrail or meta-validation tests blocks release of IDSE_Core v1.

- [ ] **Task 5.3.4 – Root Guardrail CI job** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Tasks 5.3.1, 5.3.2, 5.3.3
  - **Description:** Define and implement a dedicated CI job (or jobs) that runs the Root Guardrail Self-Test and meta-validation suite on every protected branch change.
  - **Acceptance:** The Root Guardrail CI job is required for merges to main; failures surface clearly in CI output and block releases until resolved.

- [ ] **Task 5.3.5 – Schedule Root Guardrail CI runs (nightly & pre-release)** [P]
  - **Owner:** [UNASSIGNED]
  - **Deps:** Task 5.3.4
  - **Description:** Configure the CI system to run the Root Guardrail Self-Test and meta-validation job(s) on a nightly schedule and as part of pre-release pipelines.
  - **Acceptance:** Nightly Root Guardrail runs and pre-release pipelines both execute the full Root Guardrail CI job; failures are visible to maintainers and gate releases until resolved.

---

_**Governance Traceability Footer:** Governance tools (e.g., `validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py`) and CI jobs may consume the phase traceability headers, spec section hints, and test-plan references above to verify that every governed area in the IDSE_Core specification has corresponding plan, tasks, and tests before changes are promoted._
