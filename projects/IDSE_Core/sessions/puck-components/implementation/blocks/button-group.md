# Block: ButtonGroupBlock (Task 1.18)

Purpose: Layout block to arrange multiple Button primitives with spacing and alignment controls.

## Props (example)
```typescript
interface ButtonGroupProps {
  id: string;
  align: 'left' | 'center' | 'right';
  gap: 'sm' | 'md' | 'lg';
  buttons: { id: string; label: string; href?: string; variant: ButtonVariant; size: ButtonSize }[];
}
```

## ComponentConfig
```typescript
export const ButtonGroupBlock: ComponentConfig<ButtonGroupProps> = {
  label: 'Button Group',
  category: 'Layout',
  fields: {
    id: { type: 'text', label: 'ID' },
    align: {
      type: 'radio',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Gap',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    buttons: {
      type: 'array',
      label: 'Buttons',
      arrayFields: {
        id: { type: 'text', label: 'ID' },
        label: { type: 'text', label: 'Label' },
        href: { type: 'text', label: 'Href' },
        variant: {
          type: 'select',
          label: 'Variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Destructive', value: 'destructive' },
            { label: 'Outline', value: 'outline' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Link', value: 'link' },
          ],
        },
        size: {
          type: 'select',
          label: 'Size',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Small', value: 'sm' },
            { label: 'Large', value: 'lg' },
            { label: 'Icon', value: 'icon' },
          ],
        },
      },
      defaultItemProps: { id: 'btn-1', label: 'Primary', variant: 'default', size: 'default' },
    },
  },
  defaultProps: {
    id: 'ButtonGroup-1',
    align: 'left',
    gap: 'md',
    buttons: [
      { id: 'btn-1', label: 'Primary', variant: 'default', size: 'default' },
      { id: 'btn-2', label: 'Secondary', variant: 'secondary', size: 'default' },
    ],
  },
  render: ({ align, gap, buttons }) => (
    <div
      className={cn(
        'flex flex-wrap',
        align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end',
        gap === 'sm' ? 'gap-2' : gap === 'md' ? 'gap-4' : 'gap-6'
      )}
    >
      {buttons.map((btn) => (
        <Button key={btn.id} variant={btn.variant} size={btn.size} asChild={!!btn.href}>
          {btn.href ? <a href={btn.href}>{btn.label}</a> : btn.label}
        </Button>
      ))}
    </div>
  ),
};
```

## Notes
- Safelist needs `justify-left|center|right` (translate to actual Tailwind classes: `justify-start`, etc.) and gap tokens.
- Consider mapping align to `justify-start/center/end` in production code to match Tailwind tokens.
