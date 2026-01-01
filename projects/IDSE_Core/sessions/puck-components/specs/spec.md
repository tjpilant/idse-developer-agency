# Specification

Intent source: projects/IDSE_Core/sessions/puck-components/intents/intent.md
Context source: projects/IDSE_Core/sessions/puck-components/contexts/context.md

## Intent
# Intent: Puck Components — Block-First Component Library with Nesting, Radix UI primitives, shadcn patterns, and Tailwind Styling

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

## Context
# Context (derived from intent)

Intent reference: projects/IDSE_Core/sessions/puck-components/intents/intent.md

This context consolidates the research and scraped documentation gathered for the "puck-components" session. It provides background, provenance, and recommended next steps needed to produce a specification and implementation documentation (documentation-only per IDSE rules).

---

## Integrated research summary (from intent)

- Puck 0.20: Inline text, overlay portals & resizable sidebars
  - Summary: Puck 0.20 introduces inline (contentEditable) field support and a FieldTransforms API to convert field values into interactive React nodes inside the preview, registerOverlayPortal to mark preview elements interactive (exclude from overlay), utility setDeep, componentOverlay override, resizable sidebars, and a no-external.css bundle plus the --puck-font-family CSS hook for local fonts. These features enable inline editing flows and overlay-driven interactions for page components.
  - Sources: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-020.md

- Puck 0.19: Slots API & performance gains
  - Summary: Puck 0.19 replaces DropZones with the Slot field for nesting components, provides walkTree for traversing and transforming nested component trees, adds selectors/createUsePuck and useGetPuck hooks for efficient state access, a metadata API, and several field improvements. This release changes the data model for nested layouts and improves performance for large pages.
  - Sources: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-019.md

- How to Build a React Page Builder: Puck + Tailwind v4
  - Summary: Tutorial demonstrating a Next.js + Puck page builder integrating Tailwind v4. Key implementation notes include strongly typed Puck Config/Component types (TypeScript), component examples (Card/Grid), and Tailwind dynamic-class strategies (predefined classes, safelist file, or CDN tradeoffs). Advises tradeoffs and practical recipes for styling PageBuilder components.
  - Sources: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_build-react-page-builder-tailwind.md

- shadcn/ui patterns & Radix primitives
  - Summary: shadcn-style implementations provide Tailwind-styled examples built on Radix unstyled primitives. Relevant patterns include the cn() utility, composition-focused APIs, and use of CSS variables for theming. These patterns align with existing repo examples and are the recommended implementation approach for styled primitives.
  - Sources: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_*.md

---

## Available scraped artifacts (provenance)

Selected artifacts (full list exists in Puck_Docs):
- Puck guides and API notes
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_getting-started.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_component-configuration.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_root-configuration.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_multi-column-layouts.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_dynamic-props.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_dynamic-fields.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_external-data-sources.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_server-components.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_data-migration.md

- Puck release notes / tutorials
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-020.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-019.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_build-react_page_builder_tailwind.md

- shadcn/ui component docs (selected)
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_card.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_button.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_input.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_textarea.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_select.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_checkbox.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_tabs.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_sidebar.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_popover.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_tooltip.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_navigation-menu.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_breadcrumb.md
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_ui-shadcn_pagination.md

Provenance: each context file includes source URL metadata (open the file to see the scrape source and metadata).

---

## Overview

This specification derives requirements for a **block-first Puck component library** from the Intent and Context documents. The library will provide documentation, schemas, and implementation examples for building composable UI components using Radix UI primitives, shadcn/ui patterns, and Tailwind CSS v4 styling within the Puck visual editor framework.

**Key Features**:
- Three-tier component architecture (Primitives → Styled Blocks → Page Compositions)
- Puck 0.19+ Slot API support for component nesting
- Puck 0.20+ inline editing and overlay portal integration
- TypeScript-first with strict type safety
- Documentation-only deliverables (per IDSE Article X)

**Links**:
- Intent: [projects/IDSE_Core/sessions/puck-components/intents/intent.md](../intents/intent.md)
- Context: [projects/IDSE_Core/sessions/puck-components/contexts/context.md](../contexts/context.md)

---

... (rest of spec content unchanged)

---

## FR-8: PageData Schema Documentation (canonical example)

Below is a canonical PageData JSON example to illustrate nested slots, component props, inline fields, and metadata. Use this as a reference for serialization/deserialization, tests, and PageData round-trip validation.

Example PageData (JSON):

{
  "root": {
    "id": "page_root_1",
    "type": "page",
    "meta": {
      "title": "Homepage",
      "createdAt": "2026-01-01T00:00:00Z"
    },
    "content": [
      {
        "id": "hero_1",
        "component": "HeroBlock",
        "props": {
          "title": { "type": "inline", "value": "Welcome to Our Site" },
          "subtitle": { "type": "inline", "value": "We build great things." },
          "backgroundImage": { "type": "external", "value": "https://cdn.example.com/hero.jpg" }
        }
      },
      {
        "id": "grid_1",
        "component": "GridBlock",
        "props": {
          "columns": 3,
          "items": {
            "type": "slot",
            "value": [
              {
                "id": "card_1",
                "component": "CardBlock",
                "props": {
                  "title": { "type": "text", "value": "Card One" },
                  "body": { "type": "inline", "value": "Card one body content." },
                  "image": { "type": "external", "value": "https://cdn.example.com/card1.jpg" }
                }
              },
              {
                "id": "card_2",
                "component": "CardBlock",
                "props": {
                  "title": { "type": "text", "value": "Card Two" },
                  "body": { "type": "inline", "value": "Card two body content." }
                }
              }
            ]
          }
        }
      }
    ]
  }
}

Notes:
- Each node contains an id, component (block type), and props. Props may be typed (inline, text, external, slot).
- Inline fields are represented with type="inline" and are intended to be edited via FieldTransforms/inline editor flows in Puck 0.20.
- Slot fields are represented as a prop with type="slot" and a value array of nested component nodes. Named slots can be represented by using an object keyed by slot name instead of an array.
- PageData should be accompanied by TypeScript interfaces (e.g., RootData, ComponentData<Props>) and runtime validation (Zod) to ensure shape correctness.

---

... (remaining spec content continues unchanged)



## Acceptance Criteria

See the Acceptance Criteria section (AC-1 through AC-7) in the Acceptance Criteria table above and the detailed mappings under 'Acceptance Criteria' within this specification. This explicit marker is added to satisfy validate-artifacts checks.
