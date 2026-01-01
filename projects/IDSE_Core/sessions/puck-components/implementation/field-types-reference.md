# Task 0.6 — Field Types Reference

Purpose: quick reference for the nine documented field types used in Puck component configs.

## Standard Fields

- **text** — single-line input; use for ids, short titles; supports `label`, `placeholder`.
- **textarea** — multi-line input; use for descriptions and body copy; supports `label`, `placeholder`, optional char count in UI.
- **number** — numeric input; supports `min`, `max`, `step`; use for columns, spacing, counts.
- **select** — dropdown with `options: {label,value}[]`; use for variants, alignments, sizes.
- **radio** — radio group with `options`; use when only one selection allowed and options are few.
- **checkbox** — boolean toggle; use for flags like `showBorder`, `enableShadow`.
- **external** — async picker or fetcher; use for images, pages, CMS references; include `source` identifier for the consuming app.

## Advanced Fields

- **slot** — nested component area (Puck 0.19+); supports `allowedComponents` and `max`; required for Grid/Container layouts.
- **inline** — contentEditable field rendered in preview (Puck 0.20 intent); supports optional `toolbar` controls.
- **array** — repeatable group; define `arrayFields` for each item and optional `defaultItemProps`; use for button lists or FAQ items.

## Example Snippets

```typescript
// Slot field with allowed components
items: { type: 'slot', label: 'Grid Items', allowedComponents: ['CardBlock', 'ImageBlock'], max: 12 }

// Inline field with simple toolbar
title: { type: 'inline', label: 'Headline', toolbar: ['bold', 'italic', 'link'] }

// Array field with nested defaults
buttons: {
  type: 'array',
  label: 'Buttons',
  arrayFields: {
    text: { type: 'text', label: 'Button Text' },
    url: { type: 'text', label: 'URL' },
    variant: {
      type: 'select',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ],
    },
  },
  defaultItemProps: { text: 'Click here', url: '#', variant: 'primary' },
}
```

## Usage Notes

- Stick to these types for Phase 0/1; if new field patterns arise, extend only after schema and rendering support are defined.
- Slot + inline fields should be gated by current Puck version in production, but kept in docs for forward compatibility.
- External and array fields must document expected shapes so import/export and validation schemas stay synchronized.
