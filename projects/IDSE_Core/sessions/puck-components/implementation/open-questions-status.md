# Open Questions Status (Phase 3.6)

## OQ-1: Tailwind Safelist Strategy
- Decision: Safelist file (no CDN), minimal preset for dynamic tokens. Status: ✅ resolved.
- Docs: `implementation/tailwind-strategy.md`
- Implementation: `frontend/widget/tailwind.safelist.txt`, `tailwind.config.cjs` safelist hook.

## OQ-2: PageData Persistence Layer
- Status: Deferred (Phase 1/3). Options: DB vs file storage vs CMS. Not required for current docs scope.
- Notes: Clarify target backend before implementing import/export endpoints.

## OQ-3: Component Packaging Strategy
- Status: Deferred (Phase 3). Options: monorepo package vs npm packages. No decision made yet.

## OQ-4: Storybook Deployment
- Status: Deferred (Phase 2). Current Storybook runs locally; hosting decision pending (static build vs internal docs site).

## OQ-5: Runtime Validation Library
- Decision: Zod recommended. Status: ✅ adopted in docs (schemas/tests).
