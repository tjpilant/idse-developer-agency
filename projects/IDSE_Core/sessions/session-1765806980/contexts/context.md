# Context – IDSE_Core

Intent reference: intents/projects/IDSE_Core/sessions/session-1765806980/intent.md -> # Project: IDSE_Core

## Environment
- Product: IDSE_Core engine (internal developer tooling)
- Users: IDE/CI callers, governance reviewers, IDSE contributors
- Platform: Local/CI, Python 3.11+, filesystem artifacts, no mandatory network

## Technical Environment
- Python 3.11+ CLI/MCP; filesystem storage; governance scripts invoked locally.

## Stack
- Backend/Orchestrator: Python CLI + MCP endpoints (lightweight)
- Storage: Project/session-scoped Markdown/YAML under repo paths
- Governance: `idse-governance/` scripts (validate, compliance, audit); no governance logic inside app code

## Constraints
- Separation of governance layer (`idse-governance/`) from app (`idse_developer_agent/`, src/)
- Deterministic runs; no hidden side effects or network calls
- Use existing IDSE docs as the constitutional source

## Risks & Unknowns
- Schema drift between docs and code
- Misconfiguration of governance scripts in CI
- Future integrations/targets to be clarified

## Additional Context

### Implementation Overview
The project will leverage the Puck Editor alongside Storybook to create a streamlined design and development workflow. This will include:
- **Puck Editor** for managing documentation.
- **Storybook** for visual component prototyping and testing.

### Component Development
We will generate UI/UX for building a library of React components using Tailwind CSS and Shadcn classes, ensuring styling consistency and reusability.

### Integration of the Agency Swarm Constitution
We will include functionality to integrate the Agency Swarm Constitution into the project, providing guidelines and governance support as needed.
