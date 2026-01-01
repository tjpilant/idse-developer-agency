# Intent: Import Puck & shadcn/ui research into IDSE session

Objective

Capture key findings from scraped Puck docs and selected shadcn/ui component docs so the engineering team can: (1) design page components using Puck patterns, (2) integrate CMS-driven content, and (3) reuse UI primitives from shadcn/ui for page composition.

Summaries to include in intent

- Puck 0.20: Inline text, overlay portals & resizable sidebars
  Puck 0.20 adds inline contentEditable fields and a FieldTransforms API for inline/rich text, registerOverlayPortal to make preview elements interactive, utility functions (setDeep), a new componentOverlay override, resizable sidebars, and a no-external.css bundle + --puck-font-family for local fonts. Scope: editor UX and developer extension points for inline editing, overlays, and styling.

- Puck 0.19: Slots API & performance gains
  Puck 0.19 introduces the Slot field (replacement for DropZone) for nesting components via fields, walkTree to traverse/transform nested component trees, selectors (createUsePuck) and useGetPuck for efficient state access, metadata injection, and several form/field UX improvements. Scope: data model change (slots) and performance optimizations for large pages.

- How to Build a React Page Builder: Puck + Tailwind v4
  Tutorial showing a Next.js + Puck page-builder using Tailwind v4: install Puck, define typed Config/Component props, add Card/Grid components, integrate Tailwind and strategies for dynamic Tailwind classes (predefined classes, safelist file, or CDN tradeoffs). Scope: styling strategies and implementation patterns.

- Integrating a Page Builder with Contentful
  Guide to connect Puck to Contentful using @measured/puck-field-contentful: create Blog content type, install Puck, add an Article component with a Contentful entry picker, render entries via rich-text renderer, and optionally make contentType selection dynamic via resolveFields. Scope: CMS-driven content integration for page components.

Success criteria

- intent.md contains concise summaries above and references to scraped context files.  
- context.md will be updated/stubbed to reference the intent and list available context artifacts for spec generation.

Constraints

- Produce documentation only; do not create production code.  
- Preserve provenance: include source URLs for each summary in context.
