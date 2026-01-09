# Block: HeroBlock (Task 1.12)

Purpose: Hero section with inline-editable title/subtitle, CTA, and optional background image. Supports alignment variants.

## Props (example)
```typescript
interface HeroProps {
  id: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
  align: 'left' | 'center' | 'right';
}
```

## ComponentConfig
```typescript
export const HeroBlock: ComponentConfig<HeroProps> = {
  label: 'Hero',
  category: 'Content',
  fields: {
    id: { type: 'text', label: 'ID' },
    title: { type: 'inline', label: 'Headline', toolbar: ['bold', 'italic', 'link'] },
    subtitle: { type: 'inline', label: 'Subhead' },
    ctaText: { type: 'text', label: 'CTA Text' },
    ctaUrl: { type: 'text', label: 'CTA URL' },
    backgroundImage: { type: 'external', label: 'Background image', source: 'mediaLibrary' },
    align: {
      type: 'radio',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
  defaultProps: {
    id: 'Hero-1',
    title: 'Welcome to Our Site',
    subtitle: 'We build great things.',
    ctaText: 'Get Started',
    ctaUrl: '/signup',
    align: 'center',
  },
  render: ({ title, subtitle, ctaText, ctaUrl, backgroundImage, align }) => (
    <section className="relative overflow-hidden py-16">
      {backgroundImage && (
        <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className={cn(
          'relative mx-auto max-w-4xl px-6',
          align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'
        )}
      >
        <h1 className="text-4xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
        <div className="mt-8">
          <Button size="lg" asChild>
            <a href={ctaUrl}>{ctaText}</a>
          </Button>
        </div>
      </div>
    </section>
  ),
};
```

## Notes
- Inline fields depend on Puck 0.20+; keep forward-compatible but test with current version.
- Background image uses `external` field; production should validate URL/load errors.
- Alignment tokens must be present in safelist (`text-left|center|right`).
