# Implementation Scaffold (archived)

> Original scaffold from the initial IDSE Developer Agent setup (archived on restore).

## Tasks Reference
# Tasks

## Task List
1. Review plan and spec alignment.
2. Implement planned workstreams incrementally.
3. Validate outputs against acceptance criteria.

## Source Plan
# Plan

## Scope
- Summarize scope derived from spec.

## Milestones
- Milestone 1: ...
- Milestone 2: ...

## Workstreams
- Workstream A: ...
- Workstream B: ...

## Source Spec
# Specification

## Intent
# Intent: Stand up the IDSE Developer Agent (7-tool pipeline) in this repo

## Objective
Deliver a single IDSE Developer Agent in this repository that executes the full IDSE pipeline (Intent → Context → Spec → Plan → Tasks → Implementation → Feedback) using the defined seven internal tools and Agency Swarm runtime.

## Scope
- Apply the initialization package in `docs/agency-init/IDSE-Developer-Agent-Initialization-Package/` (manifest, tools, init sequence, access guide).
- Ensure the seven pipeline tools (`generate_intent`, `derive_context`, `create_spec`, `build_plan`, `generate_tasks`, `implement_system`, `feedback_audit`) are discoverable and runnable by the agent.
- Align agent behavior and instructions with IDSE governance (constitution/pipeline) and updated Agency Builder guidance (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/workflow.mdc`).
- Validate local file tools (Read/Write/Append/Delete/List/Create dir) for repo operations.

## Constraints & Assumptions
- Environment: use the project `.venv` interpreter; avoid system Python. Keep `OPENAI_API_KEY` in `.env`.
- Models: default to `gpt-5.1`; verify availability if alternatives are needed.
- No spawning of multiple LLM agents; sub-agents remain conceptual/code artifacts within a single IDSE Developer Agent.
- No external network installs without approval (restricted network mode).

## Success Criteria
- Agent loads with all seven pipeline tools and local file tools auto-discovered from `tools_folder`.
- CLI runs in VS Code terminal (or venv Python) without hangs; key commands documented in `HOW_TO_RUN.md`.
- Governance precedence visible in `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/workflow.mdc`, and SOP cross-links.
- Artifacts created/updated per init package (manifest, tools JSON, init sequence, access guide) with no duplicate sections.
- Basic tool smoke tests pass (read/write/list files within repo).

## Next Actions
- Derive Context from this intent (constraints, environment, dependencies).
- Confirm tool implementations and discovery order against `idse-agent-tools.json` and `idse-agent-init-sequence.md`.
- Plan implementation steps to wire/verify each pipeline tool and validate local file tools.
- Execute tests and record feedback for iteration.

# Intent

## Goal
## Problem / Opportunity
## Stakeholders / Users
- Primary users and their goals:

## Success Criteria (measurable)
- Baseline → Target:
- Baseline → Target:

## Constraints / Assumptions / Risks
- Business / Compliance:
- Technical:
- Known risks:

## Scope
- In scope:
- Out of scope / non-goals:
- Dependencies:

## Time / Priority
- Deadline or target release:
- Criticality / priority:

## Context
# Context

Intent reference: intents/current/intent.md -> # Intent: Stand up the IDSE Developer Agent (7-tool pipeline) in this repo

## Environment
- (capture environment details here)

## Constraints
- (list constraints and assumptions)

## Dependencies
- (list required systems/APIs)

## Requirements
- Define functional requirements here.
- Define non-functional requirements here.

## Success Criteria
- Define measurable success criteria here.

## Notes
- Add code/test scaffolding per tasks.
- Link to relevant modules and validation scripts.
