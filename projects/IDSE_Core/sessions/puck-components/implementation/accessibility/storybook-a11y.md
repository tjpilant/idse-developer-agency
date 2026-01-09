# Task 2.5 — Storybook A11y Addon Configuration

Purpose: Document how to add accessibility checks to stories for Puck blocks/primitives.

## Setup
- Install `@storybook/addon-a11y` (add to devDependencies).
- Update `.storybook/main.ts` addons to include `"@storybook/addon-a11y"`.

## Usage
- Run `npm run storybook` and open the A11y panel to see violations per story.
- For interactive components (popover/tooltip), test focus/keyboard states by tabbing in Storybook.

## Notes
- Keep color contrast in mind for themed components; use controls to test variants.
- Use `parameters.a11y` overrides in stories if certain rules need to be disabled (sparingly).
