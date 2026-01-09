# Task 2.6 — Keyboard Navigation Checklist

Purpose: Ensure all Puck blocks/primitives meet keyboard a11y expectations.

## Checklist
- Focus order is logical and matches visual order.
- All interactive elements (buttons, links, triggers) are focusable via Tab/Shift+Tab.
- Radix components (tabs, accordion, popover, tooltip) respect Enter/Space activation and arrow key navigation where applicable.
- Skip overlay traps: popover/tooltip do not trap focus; dialog/sheets should trap if used.
- Focus ring visible (Tailwind `focus-visible:outline` + ring) for all controls.

## Testing Steps
1) Tab through Hero + Grid + Card layout; ensure CTA/button focus rings are visible.
2) TabsBlock: Arrow keys move between tabs; Enter/Space activates; focus stays inside list.
3) AccordionBlock: Enter/Space toggles items; focus moves into content only when interactive elements are inside.
4) Popover/Tooltip triggers: focusable, close on Escape or blur per Radix defaults.

## Notes
- Use Storybook to quickly manual-check focus traversal; add automated a11y tests later if needed.
- Keep `outline: none` overrides out of components; rely on Tailwind focus-visible styles.
