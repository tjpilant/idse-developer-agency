# Intent

# Project: IDSE_Core

## Overview
Foundational engine that enforces the IDSE pipeline with schemas, orchestration, and governance hooks.

## Goal
Deliver the IDSE_Core engine that enforces the IDSE pipeline (intent → feedback) with schemas, orchestration, and governance hooks.

## Problem / Opportunity
Today the IDSE docs exist but no executable core enforces them. We need a deterministic, testable engine to turn the constitution/pipeline into working automation.

## Stakeholders / Users
- IDSE developers and contributors
- Governance/compliance reviewers
- IDE/CI users invoking the pipeline via MCP/CLI

## Success Criteria (measurable)
- All core artifacts (intent/context/spec/plan/tasks/implementation/feedback) validate with no placeholders.
- Pipeline runs deterministically end-to-end on a reference session.
- Governance checks (validate, compliance, feedback audit) pass in CI.

## Constraints / Assumptions / Risks
- Python 3.11+; filesystem-scoped artifacts; no hidden network use.
- Must keep governance logic in `idse-governance/`, not in app code.
- Risk: schema drift versus docs; mitigate with validators and tests.

## Scope
- In scope: artifact schemas, pipeline orchestrator, governance adapters, MCP/CLI surfaces, traces/reports.
- Out of scope: full UI, multi-tenant cloud, heavy integrations.

## Time / Priority
- Near-term delivery of a working reference engine; iterate in short sessions with CI governance gates.

## 4 · Stakeholders / Users

| Role                                 | Responsibility                                              | Needs                                               |
| ------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------- |
| **Agency Lead / Architect**          | Oversees orchestration and quality.                         | Clarity, traceability, and simplicity.              |
| **Design Team**                      | Creates prototypes, UI/UX flows, and JS components.         | Freedom to experiment without breaking code.        |
| **IDE Agents (Claude, Codex, etc.)** | Implement plans and tasks within isolated IDE environments. | Clear, validated specs and controlled sync.         |
| **Developers / Engineers**           | Review and polish generated code; maintain tests.           | Structured documentation and task alignment.        |
| **Clients / Product Owners**         | Receive traceable artifacts and working systems.            | Transparency, reliability, and measurable outcomes. |

## 5 · Measurable Success Criteria

| Metric                            | Target                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| **Project Initialization Time**   | < 10 minutes from concept to full IDSE pipeline.              |
| **Spec-to-Code Alignment**        | ≥ 95% of implementation tasks trace directly to specs.        |
| **Feedback Loop Resolution Time** | < 24 hours from issue report to spec update.                  |
| **Supabase Sync Events**          | ≤ 3 per active project (init, mid-review, archive).           |
| **Compliance**                    | 100% of active projects validated with no `[REQUIRES INPUT]`. |
| **Auditability**                  | Every project archived with timestamp and validated state.    |

## Implementation Details
- **Puck Editor**: We will implement the Puck Editor for robust document management and editing capabilities.
- **Storybook Prototyping**: Use Storybook for prototyping UI components to ensure design consistency and developer usability.
- **UI/UX Generation**: Focus on building component libraries, including Tailwind CSS with Shadcn classes and generating React pages.
- **Agency Swarm Constitution Integration**: Provide a mechanism to integrate the Agency Swarm Constitution into the IDE project, allowing for enhanced governance and guidance throughout the development lifecycle.
