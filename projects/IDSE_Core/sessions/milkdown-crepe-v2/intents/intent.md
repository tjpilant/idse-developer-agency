# Intent: Puck Components — Block-First Component Library with Nesting, shadcn + Tailwind Styling, and Research Plan

Overview:
Build a library-quality, well-documented set of block-first UI components and integration helpers for embedding the Puck editor and PageData import/export within the IDSE Admin dashboard. Components will be small, composable block primitives that can be assembled into page-level blocks (PageBuilder). Styling will use shadcn components + Tailwind CSS. The work includes schemas, tests, Storybook examples, and a research phase to fully understand Puck editor block model and conventions.

Goals:
- Establish a block-first architecture (primitive block components + composition helpers) that supports nesting/sub-blocks where appropriate.
- Produce TypeScript + zod schemas per block, plus a versioned PageData schema that supports nested trees of block instances.
- Provide Storybook stories, unit tests, and import/export round-trip fixtures; package as frontend/packages/puck-components for local monorepo consumption.
- Research Puck editor internals (block model, serialization, existing block types, plugin patterns) using the agency research tools before detailed design/implementation.

Initial block types (prioritized):
- Heading
- Paragraph / RichText
- Image
- MediaEmbed (YouTube/iframe)
- CTA / Button
- Gallery
- Container / Columns (supports nested blocks)
- HTML/Raw (escape-hatch for embeds)

Nesting support:
- Default: allow nesting for Container/Columns and any block explicitly marked as a container in its zod schema.
- PageData will represent nested blocks as a tree structure (children: BlockInstance[]). Alternative flat-with-parentIds will be considered if research shows better compatibility with Puck internals.

Styling & UX:
- Base UI primitives built using shadcn patterns + Tailwind CSS for consistency with current frontend stack.
- Accessibility: follow ARIA and keyboard navigation guidance for editor components.

Acceptance criteria / tests:
- Each block has unit tests validating rendering and schema validation with zod.
- Storybook includes isolated stories for each block and composite stories demonstrating full-page composition and import/export round-trip.
- Round-trip import/export fixtures: at least 3 PageData examples demonstrating nesting and media embeds and validated by zod.
- Package is importable by dashboard components in the monorepo (local consumption).

Research plan (required before detailed spec):
- Deep-dive the Puck editor codebase and docs to extract block model, serialization format, plugins, and examples.
- Sources to consult: Puck editor repository, any internal PageDone template components, existing PageData fixtures, Playlists/YouTube demos, and community docs.
- Use agency research tools to gather: code patterns for blocks, example block definitions, serialization/CRDT considerations, and recommended best practices.

Constraints & assumptions:
- No CRDT/collaboration implementation in this scope (file-first JSON fixtures only), but design should keep future collab extension in mind.
- Packaging target: local monorepo package under frontend/packages/puck-components (no external registry publish in this phase).
- Team will provide PageDone templates or point to their repo paths for reference; if unavailable, I will use representative examples found during research.

Owner: frontend team / component maintainers

Deliverables:
- frontend/packages/puck-components (components, types, zod schemas, tests, stories)
- spec.md, plan.md, tasks.md, contexts/context.md (session-scoped)
- Research report summarizing Puck editor block model and recommended PageData format

Next steps (I will perform after you confirm):
- Write context.md scaffolding and research plan (done on your request).
- Run agency research tools to collect Puck editor artifacts and examples (requires confirmation).
- Generate spec.md once research findings are available.
