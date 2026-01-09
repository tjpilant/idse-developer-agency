# Block: ImageBlock (Task 1.16)

Purpose: Responsive image block with alt text and optional caption. Uses external field for asset selection.

## Props (example)
```typescript
interface ImageProps {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  aspect?: 'square' | '16-9' | '4-3';
  lazy?: boolean;
}
```

## ComponentConfig
```typescript
export const ImageBlock: ComponentConfig<ImageProps> = {
  label: 'Image',
  category: 'Media',
  fields: {
    id: { type: 'text', label: 'ID' },
    src: { type: 'external', label: 'Image source', source: 'mediaLibrary' },
    alt: { type: 'text', label: 'Alt text' },
    caption: { type: 'text', label: 'Caption' },
    aspect: {
      type: 'select',
      label: 'Aspect',
      options: [
        { label: 'Square', value: 'square' },
        { label: '16:9', value: '16-9' },
        { label: '4:3', value: '4-3' },
      ],
    },
    lazy: { type: 'checkbox', label: 'Lazy load' },
  },
  defaultProps: {
    id: 'Image-1',
    src: 'https://example.com/image.jpg',
    alt: 'Descriptive alt text',
    aspect: '16-9',
    lazy: true,
  },
  render: ({ src, alt, caption, aspect = '16-9', lazy = true }) => (
    <figure className="w-full">
      <div
        className={cn(
          'overflow-hidden rounded-lg bg-muted',
          aspect === 'square' ? 'aspect-square' : aspect === '16-9' ? 'aspect-video' : 'aspect-[4/3]'
        )}
      >
        <img
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          className="h-full w-full object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  ),
};
```

## Notes
- Alt text required for accessibility.
- External field should integrate with the app’s media picker; validate URL before render.
- Aspect ratio classes (`aspect-*`) should be in safelist if dynamically extended.*** End Patch to=functions.apply_patch માહિતી to=functions.apply_patch instrument. Let's ensure patch grammar: proper End Patch. Let's send. ***!
