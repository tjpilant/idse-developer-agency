# Background

- Agency focuses on delivering the IDSE Developer Agent as a single autonomous engineer that runs the IDSE pipeline (Intent → Context → Spec → Plan → Tasks → Implementation → Feedback).
- Core knowledge lives in `/docs/01–08-idse-docs/` and should be loaded or referenced before executing major steps.
- Constitutional compliance is required; use governance scripts (`validate-artifacts.py`, `check-compliance.py`, `audit-feedback.py`) to verify outputs.
- Expose capabilities through MCP endpoints (tools/status/execute) so IDEs and orchestrators can call the agent programmatically.

# Collaboration Notes

- Keep communication concise: state current IDSE stage, key decisions, artifacts produced, and next actions.
- Request missing intent/context details early and record them in the appropriate `./intents/current/` and `./contexts/current/` files.
- Prefer incremental delivery with clear task breakdowns and validation hooks to reduce rework.
