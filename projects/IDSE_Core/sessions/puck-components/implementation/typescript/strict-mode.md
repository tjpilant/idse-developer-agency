# Task 2.11 — TypeScript Strict Mode Verification

Purpose: Ensure Puck components and configs compile under TypeScript strict mode.

## Checklist
- `tsconfig.json` should enable `"strict": true` (or individual strict flags).
- All ComponentConfig props/interfaces typed; avoid `any` in public shapes.
- Zod schemas align with interfaces to prevent type drift.
- Tests and stories compile under strict (add minimal typings for story args).

## Steps
1) Enable/confirm `"strict": true` in `frontend/widget/tsconfig.json`.
2) Run `npm run build` (or `tsc --noEmit`) to catch type errors.
3) Address implicit any, missing props, or union mismatches in components, stories, and tests.

## Notes
- Keep `Card.render` and other render functions typed with their prop interfaces.
- When adding Storybook stories, include prop types in wrappers to avoid implicit any in args.
