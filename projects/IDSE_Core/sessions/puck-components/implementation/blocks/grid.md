# Block: GridBlock (Task 1.14)

Purpose: Responsive grid layout with Slot for nested components (Puck 0.19+ Slot API).

## Props (example)
```typescript
interface GridProps {
  id: string;
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg' | 'xl';
  items: { id: string; component: string; props: Record<string, unknown> }[];
}
```

## ComponentConfig
```typescript
export const GridBlock: ComponentConfig<GridProps> = {
  label: 'Grid',
  category: 'Layout',
  fields: {
    id: { type: 'text', label: 'ID' },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
      ],
    },
    gap: {
      type: 'radio',
      label: 'Gap',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
      ],
    },
    items: {
      type: 'slot',
      label: 'Grid Items',
      allowedComponents: ['CardBlock', 'ImageBlock', 'TextBlock', 'ButtonBlock'],
      max: 12,
    },
  },
  defaultProps: {
    id: 'Grid-1',
    columns: 3,
    gap: 'md',
    items: [],
  },
  render: ({ columns, gap, items }) => (
    <div
      className={cn(
        'grid',
        columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4',
        gap === 'sm' ? 'gap-2' : gap === 'md' ? 'gap-4' : gap === 'lg' ? 'gap-6' : 'gap-8'
      )}
    >
      {items.map((item, index) => (
        <div key={index}>{/* Puck renders nested component here */}</div>
      ))}
    </div>
  ),
};
```

## Notes
- Slot field drives nesting; allowedComponents limits palette.
- Safelist must include `grid-cols-1..4` and `gap-sm|md|lg|xl`.
- Ensure walkTree validators check `items[].props.id` is present for import/export stability.
