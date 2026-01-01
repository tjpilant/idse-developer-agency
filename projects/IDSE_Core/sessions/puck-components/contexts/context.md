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

## Technical Environment

This section records the assumed target stack, versions, and environment constraints relevant to the Puck Components work. These are recommendations for examples and documentation; actual project versions may vary and should be confirmed by the frontend team.

- Runtime / Frameworks:
  - Next.js (recommended: 13.x or later; app/router-aware examples)
  - React 18+
  - Node.js (recommended: 18.x or later)

- Styling & UI primitives:
  - Tailwind CSS v4 (examples and safelist strategies documented)
  - Radix UI primitives (@radix-ui/* packages) for unstyled accessible components
  - shadcn/ui implementation patterns (cn() utility, Tailwind composition, CSS variables)

- Tooling & Tests:
  - TypeScript (recommended: 4.8+)
  - Storybook (recommended: v7) for component examples and usage notes
  - Jest + Testing Library for unit test examples
  - ESLint / Prettier for code style examples

- Packaging & Distribution:
  - Component packages should be published as internal npm packages or monorepo packages (docs provide packaging guidance only).

- Constraints / Notes:
  - All outputs from this agent are documentation-only; no production code, configuration, or environment changes will be performed by this agent.
  - Preserve provenance: all source URLs and scraped artifacts are listed under projects/Puck_Docs and referenced above.

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
  - projects/Puck_Docs/sessions/session-01/contexts/firecrawl_build-react-page-builder-tailwind.md

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

## Recommended next actions

1. Accept this derived context or request edits. (Current file: projects/IDSE_Core/sessions/puck-components/contexts/context.md)
2. Create Specification (spec.md) derived from this context: maps behaviors to validation criteria and links to context artifacts. Reply: "create spec" to generate spec.md.
3. Generate an incremental plan and tasks for implementation documentation (plan.md, tasks.md). Reply: "plan".
4. (Optional) Copy full scraped context files into IDSE_Core session for self-contained archive. Reply: "copy all".

If you want a narrower scope (e.g., only inline editing + overlays, or only component primitives), say which scope and I will produce a targeted spec outline.
