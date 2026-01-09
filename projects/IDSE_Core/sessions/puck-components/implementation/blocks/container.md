# Block: ContainerBlock (Task 1.17)

Purpose: Layout wrapper controlling max-width and padding; exposes Slot for nested content.

## Props (example)
```typescript
interface ContainerProps {
  id: string;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding: 'none' | 'sm' | 'md' | 'lg';
  content: any[]; // Slot field value
}
```

## ComponentConfig
```typescript
export const ContainerBlock: ComponentConfig<ContainerProps> = {
  label: 'Container',
  category: 'Layout',
  fields: {
    id: { type: 'text', label: 'ID' },
    maxWidth: {
      type: 'select',
      label: 'Max width',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
        { label: 'Full', value: 'full' },
      ],
    },
    padding: {
      type: 'select',
      label: 'Padding',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    content: {
      type: 'slot',
      label: 'Content',
      allowedComponents: ['TextBlock', 'CardBlock', 'GridBlock', 'ButtonGroupBlock', 'ImageBlock', 'HeroBlock'],
    },
  },
  defaultProps: {
    id: 'Container-1',
    maxWidth: 'xl',
    padding: 'lg',
    content: [],
  },
  render: ({ maxWidth, padding, content }) => (
    <div
      className={cn(
        maxWidth === 'full' ? 'max-w-full' : `max-w-${maxWidth}`,
        padding === 'none'
          ? 'p-0'
          : padding === 'sm'
            ? 'p-4'
            : padding === 'md'
              ? 'p-6'
              : 'p-8',
        'mx-auto'
      )}
    >
      {/* Puck renders slot content here */}
      {content}
    </div>
  ),
};
```

## Notes
- Safelist must include `max-w-sm|md|lg|xl|full` and padding tokens (`p-sm|md|lg` equivalents). Adjust token names to actual Tailwind scale.
- Slot enables nesting; use in compositions to bound page width.
