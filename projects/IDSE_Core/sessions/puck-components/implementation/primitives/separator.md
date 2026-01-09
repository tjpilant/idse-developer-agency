# Primitive: Separator (Task 1.10)

Reference: `frontend/widget/src/components/ui/separator.tsx` (Radix Separator).

## Purpose
- Visual divider for grouping content in blocks (e.g., Card sections, menus).

## Props
- `orientation`: `"horizontal" | "vertical"` (default: horizontal).
- `decorative`: boolean, default `true`.
- Accepts standard div props + `className`.

## ComponentConfig Example

```typescript
interface SeparatorProps {
  id: string;
  orientation: 'horizontal' | 'vertical';
  thickness?: number;
}

export const SeparatorPrimitive: ComponentConfig<SeparatorProps> = {
  label: 'Separator',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    orientation: {
      type: 'radio',
      label: 'Orientation',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
    thickness: { type: 'number', label: 'Thickness (px)', min: 1, max: 4, step: 1 },
  },
  defaultProps: {
    id: 'Separator-1',
    orientation: 'horizontal',
    thickness: 1,
  },
  render: ({ orientation, thickness = 1 }) => (
    <Separator
      orientation={orientation}
      className={cn(orientation === 'horizontal' ? `h-[${thickness}px] w-full` : `w-[${thickness}px] h-full`)}
    />
  ),
};
```

## Notes
- The utility uses `bg-border` token; ensure theme tokens remain in Tailwind config.
- Dynamic thickness classes should be added to safelist if extended beyond defaults.
