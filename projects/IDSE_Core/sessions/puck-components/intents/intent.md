# Intent: Puck Components — Block-First Component Library with Nesting, Radix UI primitives, shadcn patterns, and Tailwind Styling

## Overview

Build a library-quality, well-documented set of block-first UI components and integration helpers for embedding the Puck editor and PageData import/export within the IDSE Admin dashboard. The goal is to produce documentation, API descriptions, Storybook examples, and test examples that enable the frontend team to implement production-quality components. The work prioritizes small, composable block primitives that support nesting/slots (to match Puck’s block model), use Radix unstyled primitives implemented following shadcn/ui patterns, and are styled with Tailwind CSS and CSS variables. All outputs from this agent are documentation-only; production code will be implemented by the engineering team.

Summary

Build a library-quality, well-documented set of block-first UI components and integration helpers for embedding the Puck editor and PageData import/export within the IDSE Admin dashboard. Components will be small, composable block primitives that can be assembled into page-level blocks (PageBuilder). Styling will use Radix UI primitives implemented following shadcn/ui patterns and styled with Tailwind CSS and CSS variables. The work includes schemas, tests, Storybook examples, and a research phase to fully understand Puck editor block model and conventions.

Objectives

- Provide a reusable block-first component library that follows Radix APIs and shadcn/ui implementation patterns.
- Implement styled primitives (composition, cn() utility, Tailwind classes, CSS variables) that align with existing repo patterns.
- Support nesting and slots to reflect Puck’s block model and enable PageData import/export helpers for the IDSE Admin dashboard.
- Produce documentation, Storybook stories with usage notes, unit tests, and packaging guidance for component maintainers.

Scope

In-scope:
- Component design and documentation (Radix-based unstyled primitives + shadcn-style styled implementations).
- Block-first composition patterns, nesting/slot support, and PageData import/export helper documentation.
- Storybook stories, unit test examples, schemas for component props, and developer-facing implementation notes.

Out-of-scope:
- Writing production application code beyond documentation and illustrative examples.
- Third-party CMS integration (removed from scope).
- Modifying IDSE constitutional artifacts.

Success criteria

- Intent clearly expresses goals, scope, and owner for component library work.
- Intent enables the spec to derive component requirements, Slot APIs, and validation steps (stories/tests) without relying on external CMS integrations.
- Context.md will record provenance and scraped sources used for research (Puck docs, shadcn patterns, repo examples).

Constraints & Assumptions

- Documentation-only deliverables; no production code will be created by this agent.
- Preserve provenance: source URLs and scraped artifacts will be recorded in context.md (not embedded here).
- Assume Next.js + Tailwind v4 and Radix primitives as the target stack for examples.

Owner

Front-end team / component maintainers

Next actions

- Derive/update projects/IDSE_Core/sessions/puck-components/contexts/context.md from this intent and existing scraped artifacts.
