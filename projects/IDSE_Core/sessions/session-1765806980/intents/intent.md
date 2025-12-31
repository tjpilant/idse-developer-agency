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
