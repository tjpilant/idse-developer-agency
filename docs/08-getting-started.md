# Getting Started with the IDSE Developer Agent

Welcome to the **IDSE Developer Agent** project. This guide helps AI agents and
human contributors get productive quickly. It explains how to use the
repository, follow the IDSE methodology, and contribute effectively.

## 1. Repository Overview

This repo defines the Intent-Driven Systems Engineering (IDSE) methodology and
includes:

- `docs/` – Philosophy, pipeline, constitution, prompting, patterns, and this
  guide.
- `kb/templates/` – Templates for intent, context, specs, plans, tasks, and test
  plans.
- `kb/examples/` – End-to-end examples of the IDSE pipeline.
- `kb/playbooks/` – Operational playbooks for features, refactors, bug fixes,
  and change requests.
- `prompts/` – System prompts to configure a Custom GPT as a Developer Agent.
- `AGENTS.md` – Guidelines for AI assistants and human contributors.
- `.github/workflows/validate-kb.yml` – CI check that fails if unresolved
  REQUIRES INPUT markers remain in docs or examples.

## 2. Using the Developer Agent

The Developer Agent acts as a virtual senior engineer who follows the IDSE
pipeline:

1. **Clarify intent and context:** Create `intent.md` and `context.md` from
   `kb/templates/`, capturing goals, success criteria, stack, constraints, and
   risks.
2. **Generate a specification:** Draft `spec.md` with functional and
   non-functional requirements, user stories, and acceptance criteria. Mark
   unknowns with a REQUIRES INPUT marker until resolved.
3. **Produce an implementation plan:** Write `plan.md` with architecture,
   components, data models, API contracts, test strategy, and phases.
4. **Break down into tasks:** Write `tasks.md` with atomic tasks derived from
   the plan. Mark independent work with `[P]`.
5. **Implement:** Generate code and tests to satisfy tasks, honoring the plan
   and specification.
6. **Validate:** Ensure all REQUIRES INPUT markers are cleared; run tests per
   the plan.
7. **Review and iterate:** Apply feedback from reviews and production; update
   intent, context, or specs as needed.

## 3. Running the Validation Workflow

Run the CI check locally to ensure no unresolved placeholders remain:

```bash
grep -R "REQUIRES INPUT" -n kb/ docs/ --exclude-dir templates \
  || echo "✔ No unresolved inputs"
```

Templates under `kb/templates/` intentionally contain placeholders and are
excluded from the check.

## 4. Contributing Guidelines

- Describe changes: Note which artifacts (intent, context, spec, plan, tasks,
  docs) you updated and why.
- Follow IDSE principles: Respect the constitution (intent supremacy, context
  alignment, specification completeness, test-first, simplicity, transparency,
  plan-before-build, atomic tasking, feedback incorporation).
- Commit messages: Be clear and refer to the artifact or stage (e.g., "Add test
  plan template", "Refine notification plan for GDPR logging").
- Do not commit secrets: Never include keys or tokens.
- Multiple packages: If you add subprojects, include an `AGENTS.md` in each with
  package-specific guidance.

## 5. Learning More

- **Philosophy:** `docs/01-idse-philosophy.md`
- **Artifacts compared:** `docs/04-idse-spec-plan-tasks.md`
- **SDD to IDSE evolution:** `docs/07-sdd-to-idse.md`
- **Example walkthrough:** `kb/examples/real-time-notifications.md`

IDSE is a living methodology—suggest improvements, add templates or playbooks,
and keep artifacts consistent so teams and agents build better systems together.
