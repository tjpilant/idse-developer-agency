# Block: TextBlock (Task 1.15)

Purpose: Rich text block with inline editing support (Puck 0.20 inline field) for headings and body copy.

## Props (example)
```typescript
interface TextProps {
  id: string;
  heading?: string;
  body: string;
  align: 'left' | 'center' | 'right';
  variant: 'default' | 'muted' | 'lead';
}
```

## ComponentConfig
```typescript
export const TextBlock: ComponentConfig<TextProps> = {
  label: 'Text',
  category: 'Content',
  fields: {
    id: { type: 'text', label: 'ID' },
    heading: { type: 'inline', label: 'Heading' },
    body: { type: 'inline', label: 'Body' },
    align: {
      type: 'radio',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Muted', value: 'muted' },
        { label: 'Lead', value: 'lead' },
      ],
    },
  },
  defaultProps: {
    id: 'Text-1',
    heading: 'Section title',
    body: 'Body copy goes here.',
    align: 'left',
    variant: 'default',
  },
  render: ({ heading, body, align, variant }) => (
    <div
      className={cn(
        align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'
      )}
    >
      {heading && (
        <h3
          className={cn(
            'text-xl font-semibold',
            variant === 'muted' && 'text-muted-foreground'
          )}
        >
          {heading}
        </h3>
      )}
      <p
        className={cn(
          'mt-2 text-base leading-relaxed',
          variant === 'muted' && 'text-muted-foreground',
          variant === 'lead' && 'text-lg'
        )}
      >
        {body}
      </p>
    </div>
  ),
};
```

## Notes
- Inline fields provide in-preview editing for heading/body; ensure Puck version compatibility.
- Alignment/variant classes must be safelisted (`text-left|center|right`, `text-lg` etc.).
- For richer markup, integrate markdown/inline editor at composition level; keep this block simple for inline text.*** End Patch ko to=functions.apply_patch ન assistant to=functions.apply_patchဳ尼斯人 JSON batching omit editing go apply patch string grammar correct merge. Ensuring "End Patch" newline. Let's supply patch properly.***
