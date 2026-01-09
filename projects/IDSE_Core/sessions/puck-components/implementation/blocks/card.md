# Block: CardBlock (Task 1.13)

Purpose: Content card with optional image and actions. Built on Card primitive.

## Props (example)
```typescript
interface CardBlockProps {
  id: string;
  title: string;
  body: string;
  image?: string;
  variant: 'default' | 'outline';
  ctaLabel?: string;
  ctaUrl?: string;
}
```

## ComponentConfig
```typescript
export const CardBlock: ComponentConfig<CardBlockProps> = {
  label: 'Card',
  category: 'Content',
  fields: {
    id: { type: 'text', label: 'ID' },
    title: { type: 'text', label: 'Title' },
    body: { type: 'textarea', label: 'Body' },
    image: { type: 'external', label: 'Image', source: 'mediaLibrary' },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ],
    },
    ctaLabel: { type: 'text', label: 'CTA Label' },
    ctaUrl: { type: 'text', label: 'CTA URL' },
  },
  defaultProps: {
    id: 'Card-1',
    title: 'Card title',
    body: 'Card body copy',
    variant: 'default',
  },
  render: ({ title, body, image, variant, ctaLabel, ctaUrl }) => (
    <Card className={cn(variant === 'outline' && 'border-dashed')}>
      {image && <img src={image} alt="" className="h-40 w-full rounded-t-xl object-cover" />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
      {(ctaLabel && ctaUrl) && (
        <CardFooter>
          <Button variant="outline" size="sm" asChild>
            <a href={ctaUrl}>{ctaLabel}</a>
          </Button>
        </CardFooter>
      )}
    </Card>
  ),
};
```

## Notes
- Uses Card primitive structure; image optional.
- Variant toggles border style; ensure safelist includes any dynamic border classes if added.
- For POC-1, nest CardBlock inside GridBlock Slot to demonstrate Slot integration and inline editing on parent blocks.
