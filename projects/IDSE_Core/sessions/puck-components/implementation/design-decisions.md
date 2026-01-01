# Task 0.5 — Design Decisions

Document the core principles that drive component docs and examples.

## Radix + shadcn for Primitives
- Decision: use Radix primitives wrapped with shadcn-style implementations (cn(), Tailwind tokens, CSS variables) as the baseline for Tier 1.
- Rationale: matches existing `frontend/widget/src/components/ui/*`, keeps accessibility baked in, and reduces divergence between documentation and production.

## Slot API First (Puck 0.19+)
- Decision: prefer Slot fields over DropZones; blocks should expose named or array Slots for nested layouts.
- Rationale: aligns with current Puck dependency (^0.19.3), improves performance, and simplifies walkTree validation for nested PageData.

## Documentation-Only Scope
- Decision: all Phase 0 deliverables live in `projects/IDSE_Core/sessions/puck-components/implementation/` and remain examples/guides, not production code.
- Rationale: complies with IDSE Article X and governance boundary (no application code in governance layer; no governance artifacts in app code).

## TypeScript-First + Runtime Schemas
- Decision: every documented component includes TypeScript interfaces and Zod schemas for props and PageData.
- Rationale: supports strict typing (FR-12/FR-13), enables import/export validation, and keeps editor/runtime parity clear.

## Tailwind Strategy (OQ-1)
- Decision: adopt a repository-owned safelist file for dynamic Tailwind classes used by Puck components; avoid CDN runtime; keep small preset class tokens for common variants.
- Rationale: predictable bundle size, offline builds, and alignment with existing Tailwind 3.x config while preparing for Tailwind v4 migration.
