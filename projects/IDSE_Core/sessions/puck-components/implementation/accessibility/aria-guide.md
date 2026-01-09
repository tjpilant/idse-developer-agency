# Task 2.7 — ARIA Attribute Guide

Purpose: Document ARIA usage for Puck components to ensure screen reader compatibility.

## Guidelines
- Buttons/links: Ensure `aria-label` present for icon-only buttons (e.g., Button variant with no text).
- Accordion: Radix handles roles/aria by default; keep headings textful and avoid empty triggers.
- Tabs: Radix provides roles/ids; ensure `TabsTrigger` labels are meaningful.
- Tooltip/Popover: Use for supplementary info only; avoid critical content in tooltip; ensure trigger has an accessible name.
- Images: Require `alt` text in ImageBlock; if decorative, allow explicit empty alt.
- Forms: Inputs should have visible labels; wrap in `<label>` or use `aria-label/aria-labelledby`.

## Patterns
- Icon-only CTA (e.g., circular button): add `aria-label="Open collections"` or similar.
- Marquee/animation: set `aria-hidden="true"` on purely decorative repeated marquee items.

## Notes
- Lean on Radix defaults where possible; avoid custom role attributes unless necessary.
- Validate with Storybook a11y addon and manual screen reader checks for key flows.
