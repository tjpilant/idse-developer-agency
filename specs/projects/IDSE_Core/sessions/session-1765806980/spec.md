# Specification

Intent source: /home/tjpilant/projects/idse-developer-agency/intents/projects/IDSE_Core/sessions/session-1765806980/intent.md
Context source: /home/tjpilant/projects/idse-developer-agency/contexts/projects/IDSE_Core/sessions/session-1765806980/context.md

## Intent
# Project: IDSE_Core

## Purpose
Build the **core engine and artifact schemas** that orchestrate the full IDSE pipeline from intent through feedback.
It acts as the validator and enforcement layer for the broader IDSE ecosystem, ensuring that all derivative agents and projects conform to the IDSE constitution.

## Outcome
A **reusable, verifiable foundation** for AI-driven engineering workflows — translating
`intent → context → specification → plan → tasks → implementation → feedback` — with **constitutional guardrails baked in** and enforceable via the governance stack.

## High-Level Intent
Design and implement the **IDSE_Core** engine that orchestrates the full IDSE pipeline
`Intent → Context → Spec → Plan → Tasks → Implementation → Feedback` for software projects. IDSE_Core should provide reusable abstractions, tooling adapters, and MCP/IDE endpoints while strictly honoring the IDSE constitution and governance separation.

## Current State / Starting Point
- We are **not starting from scratch**.
- The **philosophy, constitution, agent roles, and pipeline definitions** already exist in Markdown documentation (the `docs/` set, including `/docs/01–08-idse-docs/`).
- There is **no executable or structured core yet** — no schema, data model, or automation that enforces or validates IDSE stages.
- Status of existing **governance scripts and automation** (e.g., `validate_artifacts.py`, `check_root_artifacts.py`, planned `check-compliance` and `audit-feedback` tools): Governance validation is currently provided by prototype guardrail scripts. `scripts/validate_artifacts.py` (invoked via `python3 scripts/validate_artifacts.py`) checks the current project's core artifacts (`intent.md`, `context.md`, `spec.md`, `plan.md`, `test-plan.md`, `tasks.md`, `implementation/README.md`, `feedback.md`) for required sections and `[REQUIRES INPUT]` markers and exits non-zero on failure while printing human-readable diagnostics to stdout. `scripts/check_root_artifacts.py` enforces allowed root-level artifacts. Dedicated `check-compliance` and `audit-feedback` governance CLIs are planned but not yet implemented; structured JSON report outputs and per-stage governance wiring remain to be added.

## Objectives
- **Codify what is currently in the IDSE docs into functional modules**:
  - **Validators** that check artifacts and pipelines against the IDSE constitution and rules.
  - **Artifact generators** that produce intent, context, specs, plans, tasks, implementation scaffolding, and feedback structures.
  - **Orchestrators** that enforce stage ordering and coordinate tools, governance checks, and external integrations.
- Define a clear, extensible architecture for the IDSE pipeline stages and artifact schemas.
- Implement core orchestration logic that can:
  - Ingest and store intent and context artifacts.
  - Generate specification, plans, tasks, and implementation scaffolding.
  - Capture and integrate feedback in a repeatable loop.
- Integrate with the governance stack (validate-artifacts, compliance checks, feedback audit) without embedding governance logic directly into application code.
- Expose capabilities via MCP/IDE endpoints so external tools can:
  - Query current status and artifacts.
  - Trigger pipeline execution (full or partial).
  - Supply feedback and updated intent/context.
- Establish IDSE_Core as the single source of truth for IDSE artifact schemas, pipeline semantics, and constitutional validation behavior.

## Scope (Initial Version)

### In Scope (v1)
- **Core schemas and data models** for all IDSE artifacts:
  - intent, context, specification, plan, tasks, implementation notes, feedback, and validation/audit reports.
- **Functional modules** that codify the docs into working components:
  - **Artifact generators** for each stage, wrapping the existing IDSE tools where appropriate.
  - **Validators** that enforce:
    - Stage ordering and completeness.
    - Basic structural and constitutional rules derived from the docs.
  - **Orchestrators** that:
    - Execute the pipeline in strict order (`Intent → Context → Spec → Plan → Tasks → Implementation → Feedback`).
    - Coordinate calls to the existing tools and governance scripts.
- **Artifact storage and retrieval** mechanisms aligned with the current project/session path conventions.
- **Minimal MCP/IDE-facing API surface** to:
  - Trigger full or partial pipeline runs.
  - Query pipeline status and artifact locations.
  - Submit updated intent, context, or feedback.
- **Hooks for governance integration** that:
  - Invoke existing governance scripts (e.g., validate/compliance/audit).
  - Collect and surface their results without re-implementing governance logic.

### Out of Scope (Initial Version)
- Rich UI/front-end dashboards.
- Non-essential third-party integrations beyond what is needed for core MCP/IDE workflows.
- Custom governance logic (must remain in the separate governance layer, not inside IDSE_Core).
- Advanced concerns such as multi-tenant orchestration, distributed execution, or heavy performance optimization.

## Constraints & Principles
- Respect strict separation between governance layer (e.g., idse-governance/) and application code (e.g., idse_developer_agent/, src/).
- Follow the IDSE Constitution as the authoritative guide for pipeline behavior and artifact quality.
- Design for testability and extensibility: clear interfaces, minimal coupling, and support for future stages/tools.
- IDSE_Core may invoke governance scripts and consume their outputs, but must not duplicate, alter, or embed governance decision logic; it only routes and surfaces findings from the governance layer.

## Non-Functional Requirements (Draft)

> These NFRs are intentionally minimal and may contain `[REQUIRES INPUT]` placeholders to be refined later.

### Performance

- **NFR-PERF-1**: For a single-project, single-session pipeline run from Intent through Plan using local tools, the total wall-clock time on a reference developer machine (specification **[REQUIRES INPUT]**) should be ≤ **[REQUIRES INPUT]** seconds under normal conditions.
- **NFR-PERF-2**: Orchestrator overhead per stage transition (excluding the time taken by external tools or governance scripts) should be ≤ **[REQUIRES INPUT]** milliseconds on the reference machine.
- **NFR-PERF-3**: For governance CLI validation runs per stage (e.g., `validate-artifacts.py`, `check-compliance.py`), the total wall-clock time on a reference developer machine should be ≤ **3 seconds per stage** under normal load.

### Reliability & Failure Handling

- **NFR-REL-1**: 100% of orchestrated operations must either complete successfully or return a structured error; silent failures are not allowed.
- **NFR-REL-2**: On tool or governance failure (non-zero exit, timeout, or malformed output), the orchestrator must:
  - Avoid writing partial downstream artifacts for the affected stage.
  - Record a validation/feedback artifact describing the failure.
  - Surface a machine-readable error to callers.
- **NFR-REL-3**: The orchestrator must recover gracefully from partial runs: on restart, it should detect existing artifacts and validation reports, determine the last consistent stage, and allow safe re-execution or continuation from that stage without corrupting artifacts.

### Observability & Traceability

- **NFR-OBS-1**: Each pipeline execution must have a unique run identifier and a structured trace that includes at minimum: projectId, sessionId, runId, stages executed, tools/governance scripts invoked, and artifact IDs read/written.
- **NFR-OBS-2**: Traces/logs must be available in a human-readable form (e.g., text logs) and a machine-readable form (e.g., JSON lines or structured events). Exact log storage location and retention policy are **[REQUIRES INPUT]**.
- **NFR-OBS-3**: All orchestrator and governance operations must log to human-readable audit trails, including at least timestamp, operation type, target project/session, stage, and outcome. Exact audit trail format and storage location are **[REQUIRES INPUT]**.

### Security & Isolation

- **NFR-SEC-1**: By default, IDSE_Core must operate in an offline-safe mode: no network calls are made unless explicitly configured via governance or integration settings.
- **NFR-SEC-2**: Governance tools invoked via CLI must be executed with paths and environment restricted to the current project/session and governance layer. Any sandboxing mechanism (e.g., containers, venvs) is **[REQUIRES INPUT]**.

### Extensibility & Compatibility

- **NFR-EXT-1**: Adding a new governance tool or integration should not require changes to the core orchestrator code; it should be achievable via configuration (`GovernanceIntegrationConfig`) and, if needed, small adapter modules.
- **NFR-EXT-2**: All artifacts should carry an `engineVersion` that matches the IDSE_Core engine version at creation time to support compatibility tracking and future migrations.
- **NFR-EXT-3**: New artifact kinds should be addable without changing the core artifact base schema; extension should be achieved via new `kind` values and derived interfaces that preserve compatibility with `ArtifactBase`.

## Success Criteria (Initial Milestone)
- A developer or orchestrator can:
  - Provide project intent and minimal context.
  - Trigger the IDSE pipeline and obtain generated spec, plan, tasks, and implementation scaffolding.
  - Run governance validation scripts against produced artifacts.
- The system can be invoked programmatically (e.g., via MCP/IDE integrations) with clear status reporting and error handling.
- For any pipeline execution, a consumer can reconstruct which artifacts were read and written, which tools and governance scripts ran, and why each stage advanced or failed, using stored traces and validation/feedback artifacts.

### Engine Acceptance Criteria

1. **Stage ordering enforcement**
   - The engine must prevent execution of any downstream stage (e.g., Plan, Tasks, Implementation) when required upstream artifacts (Intent, Context, Spec) are missing or invalid, and must return a structured error without writing partial artifacts for that stage.

2. **Constitutional and structural validation**
   - For each stage transition, the engine must validate artifacts against constitutional rules and basic structural schemas, and must refuse to advance the pipeline when violations are present, surfacing clear, machine-readable findings.

3. **Deterministic behavior for a given input set**
   - Given the same project, session, inputs, configuration, and tool versions, the engine must produce the same artifacts and validation outcomes, or explicitly record any non-deterministic factors in metadata.

4. **Governance integration and reporting**
   - When configured, the engine must be able to invoke governance scripts (e.g., `validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py`) and persist their outputs as validation/feedback artifacts linked to the relevant pipeline artifacts.

5. **Traceable execution**
   - Each pipeline run must produce a trace (log or structured report) that records which stages executed, which tools/governance scripts were invoked, which artifacts were read/written, and the reasons for any failures or blocked transitions.

### Example Success Tests (Scenarios)

1. **Happy-path pipeline execution**
   - Given a valid `intent.md` and `context.md` for a project/session, when the orchestrator is asked to run through Specification and Planning, then within **2 seconds**:
     - A valid `spec.md` and `plan.md` are generated at the correct project/session paths.
     - All generated artifacts pass structural validation and constitutional checks.
     - No governance findings of level `error` are produced for these stages.

2. **Missing context blocks downstream stages**
   - Given a valid `intent.md` but no `context.md` for a project/session, when the orchestrator is asked to proceed beyond Context, then:
     - No `spec.md` or `plan.md` artifacts are written.
     - The orchestrator returns a structured error indicating that Context is missing.
     - A feedback/validation artifact is recorded marking the pipeline as blocked at the Context stage.

3. **Governance violation stops the pipeline**
   - Given intent, context, and spec artifacts where the spec violates a constitutional rule, when the orchestrator attempts to advance to Planning and runs the configured governance scripts, then:
     - No new `plan.md` is written.
     - At least one `validationReport` artifact is created with `passed = false` and a level `error` finding.
     - The orchestrator surfaces this failure to the caller in a machine-readable form.

4. **Deterministic repeated runs**
   - Given the same project/session, inputs (intent/context), configuration, and tool versions, when the orchestrator is run twice for the same stages, then:
     - The resulting artifacts (e.g., `spec.md`, `plan.md`, `tasks.md`) are byte-identical or differ only in allowed metadata fields (timestamps, run IDs).
     - Any differences are explicitly tracked in metadata fields rather than silent content drift.

5. **IDE/MCP client interaction**
   - Given an IDE or MCP client connected to IDSE_Core for a project/session with valid intent and context, when the client repeatedly requests "next valid stage" and triggers it, then:
     - The pipeline advances in order through Spec → Plan → Tasks → Implementation scaffolding.
     - At each step, the client can query and retrieve the latest artifact paths and any outstanding `[REQUIRES INPUT]` markers.
     - The pipeline halts automatically at the first stage that requires additional human input or has failing governance checks.

## Open Questions [REQUIRES INPUT]
- Preferred implementation language and runtime environment for IDSE_Core.
- Target deployment context for initial integrations (e.g., specific IDEs, CLIs, or orchestrators).
- Any non-functional requirements (performance, security, multi-user support) that must be considered from day one.
- Status of existing **governance scripts and automation** once clarified.

## Core Data Model (v1 Draft)

> Note: This is language-agnostic. Think of these as interfaces or JSON schemas that can be mapped to your chosen stack.

### Common Base Type

All artifacts share common metadata:

- `id`: unique identifier
- `projectId`: project key (e.g., `IDSE_Core`)
- `sessionId`: IDSE session identifier
- `kind`: one of `intent | context | specification | plan | task | feedback | validationReport`
- `engineVersion`: IDSE_Core engine semver that produced this artifact
- `version`: artifact version, incremented when content changes
- `status`: lifecycle state (e.g., `draft` | `active` | `superseded` | `archived`)
- `createdAt`, `updatedAt`: timestamps
- `sourcePath`: backing file path, where applicable
- `metadata`: free-form key/value map (author, tool versions, etc.)

```ts
type ArtifactKind =
  | 'intent'
  | 'context'
  | 'specification'
  | 'plan'
  | 'task'
  | 'feedback'
  | 'validationReport';

interface ArtifactBase {
  id: string;
  projectId: string;
  sessionId: string;
  kind: ArtifactKind;
  version: string; // artifact version, incremented when content changes
  engineVersion: string; // IDSE_Core engine semver that produced this artifact
  status: 'draft' | 'active' | 'superseded' | 'archived';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  sourcePath?: string;
  metadata?: Record<string, unknown>;
}
```

### Intent

Captures purpose, outcome, high-level goals, scope, and open questions.

```ts
interface IntentArtifact extends ArtifactBase {
  kind: 'intent';
  title: string;
  purpose: string;
  outcome?: string;
  highLevelIntent: string;
  objectives: string[];
  inScope: string[];
  outOfScope: string[];
  constraints: string[];
  successCriteria: string[];
  openQuestions: string[]; // '[REQUIRES INPUT]' items live here
}
```

### Context

Describes environment, stack, constraints, and risks that shape the solution.

```ts
interface ContextArtifact extends ArtifactBase {
  kind: 'context';
  intentId: string; // FK → IntentArtifact.id

  environment: {
    product?: string;
    domain?: string;
    users?: string[]; // roles / personas
  };

  stack: {
    frontend?: string;
    backend?: string;
    database?: string;
    infrastructure?: string;
    integrations?: string[];
  };

  constraints: {
    scale?: string;
    performance?: string;
    complianceSecurity?: string;
    teamCapabilities?: string;
    deadlines?: string;
    legacy?: string;
  };

  risks: string[];
  unknowns: string[];
}
```

### Specification

Formalizes requirements derived from intent + context.

```ts
interface SpecificationArtifact extends ArtifactBase {
  kind: 'specification';
  intentId: string;
  contextId: string;

  overview: string;

  userStories: {
    id: string;
    role: string;
    goal: string;
    benefit: string;
  }[];

  functionalRequirements: {
    id: string; // e.g., 'FR-1'
    description: string;
    priority?: 'must' | 'should' | 'could';
  }[];

  nonFunctionalRequirements: {
    id: string; // e.g., 'NFR-1'
    category: string; // performance, security, etc.
    description: string;
  }[];

  acceptanceCriteria: {
    id: string; // e.g., 'AC-1'
    description: string;
    relatedRequirementIds?: string[];
  }[];

  assumptions: string[];
  constraints: string[];
  dependencies: string[];
  openQuestions: string[];
}
```

### Plan

Breaks the spec into epics/milestones and links back to requirements.

```ts
interface PlanArtifact extends ArtifactBase {
  kind: 'plan';
  specificationId: string;

  epics: {
    id: string;
    title: string;
    description: string;
    relatedRequirementIds?: string[]; // FR/NFR ids
  }[];

  milestones: {
    id: string;
    title: string;
    description?: string;
    targetDate?: string; // ISO
    epicIds?: string[];
  }[];
}
```

### Task

Atomic units of work derived from the plan.

```ts
interface TaskArtifact extends ArtifactBase {
  kind: 'task';
  planId: string;

  title: string;
  description: string;
  status:
    | 'todo'
    | 'in_progress'
    | 'blocked'
    | 'in_review'
    | 'done';

  priority?: 'low' | 'medium' | 'high';
  assignee?: string;

  relatedEpicId?: string;
  relatedRequirementIds?: string[];

  dependsOnTaskIds?: string[];
  estimate?: number; // story points or hours
}
```

### Feedback

Captures feedback from users, governance scripts, or tools and links it to artifacts.

```ts
interface FeedbackArtifact extends ArtifactBase {
  kind: 'feedback';

  target: {
    artifactKind: ArtifactKind;
    artifactId: string;
  };

  source: {
    type: 'user' | 'governance' | 'tool' | 'test';
    name?: string; // e.g., 'validate-artifacts.py'
  };

  category:
    | 'bug'
    | 'change_request'
    | 'improvement'
    | 'question'
    | 'governance_violation';

  severity?: 'low' | 'medium' | 'high' | 'critical';

  summary: string;
  details?: string;

  resolutionStatus:
    | 'untriaged'
    | 'acknowledged'
    | 'in_progress'
    | 'resolved'
    | 'rejected';

  linkedArtifactIds?: string[]; // e.g., tasks created to address the feedback

  /** Optional governance linkage for constitutional traceability */
  constitutionalArticleIds?: string[];
  governancePolicyIds?: string[];
}
```

### Validation Report (Optional but Recommended)

Represents outputs from governance scripts and validators.

```ts
interface ValidationReportArtifact extends ArtifactBase {
  kind: 'validationReport';

  target: {
    artifactKind: ArtifactKind;
    artifactId: string;
  };

  validatorName: string; // e.g., 'check-compliance.py'
  passed: boolean;

  findings: {
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    relatedFieldPath?: string; // e.g., 'functionalRequirements[2].description'
  }[];

  /** Optional governance linkage for constitutional traceability */
  relatedConstitutionalArticles?: string[];
  relatedGovernancePolicies?: string[];
}
```

This core data model keeps each artifact type focused but linked, enabling:
- Strict stage ordering and traceability (intent → context → spec → plan → tasks → feedback/validation).
- Governance scripts to attach structured findings to specific artifacts.
- IDE/MCP integrations to reason about and manipulate artifacts in a type-safe way.

### Governance Integration Config

```ts
type PipelineStage =
  | 'intent'
  | 'context'
  | 'specification'
  | 'plan'
  | 'tasks'
  | 'implementation'
  | 'feedback';

type GovernanceOutputFormat = 'json' | 'yaml' | 'text';

interface GovernanceToolConfig {
  /** Logical name, e.g. 'check-compliance' or 'validate-artifacts' */
  name: string;

  /** Script file or entry point name within the governance layer */
  scriptName: string; // e.g. 'validate-artifacts.py'

  /** How this tool is invoked: local CLI vs remote/local API */
  invocationMode: 'cli' | 'api';

  /**
   * Executable/command to invoke (for 'cli' mode),
   * may wrap or locate scriptName.
   * Example: 'python3 idse-governance/validate-artifacts.py'
   */
  command?: string;

  /**
   * API endpoint to call (for 'api' mode),
   * e.g. 'http://localhost:8080/governance/validate'.
   */
  apiEndpoint?: string;

  /** Stages at which this tool should be invoked */
  stages: PipelineStage[];

  /** Artifact kinds this tool expects as inputs (for routing + validation) */
  inputTypes: ArtifactKind[]; // e.g. ['specification', 'plan']

  /**
   * What kind of artifact this tool primarily emits.
   * For v1 we assume 'validationReport', but this keeps it extensible.
   */
  outputKind: 'validationReport';

  /** Optional extra CLI args, if needed (cli mode) */
  args?: string[];

  /** Environment variables to set when invoking the tool (cli mode) */
  env?: Record<string, string>;

  /** Max time in seconds before the run is treated as a failure */
  timeoutSeconds?: number;

  /** Expected output format for parsing into ValidationReport/Feedback artifacts */
  outputFormat: GovernanceOutputFormat;

  /**
   * Which finding levels should block stage advancement.
   * e.g. ['error'] or ['error', 'warning']
   */
  blockingLevels?: Array<'error' | 'warning' | 'info'>;

  /** Whether a tool crash/timeout should block the pipeline (default: true) */
  blockOnFailure?: boolean;
}

interface GovernanceIntegrationConfig {
  /** Master switch for governance integration */
  enabled: boolean;

  /** Per-tool configuration */
  tools: GovernanceToolConfig[];

  /** Default blocking levels if not overridden per tool */
  defaultBlockingLevels?: Array<'error' | 'warning' | 'info'>;

  /** Optional global timeout, overridden by per-tool timeouts */
  defaultTimeoutSeconds?: number;
}
```

#### Versioning Note

Changes to `GovernanceIntegrationConfig` and `GovernanceToolConfig` should be backward compatible within a major version. New fields should be added as optional whenever possible. Removing fields or changing their semantics requires a coordinated schema/config version bump and migration strategy, and downstream tools must treat unknown fields as non-fatal. All artifacts should carry an `engineVersion` matching the IDSE_Core engine version for compatibility tracking, while the artifact `version` field tracks the artifact's own revision within that schema. Each artifact must record both its own version (artifact lifecycle) and the producing `engineVersion` (IDSE_Core semver) to support validation, backward compatibility, and audit traceability.
