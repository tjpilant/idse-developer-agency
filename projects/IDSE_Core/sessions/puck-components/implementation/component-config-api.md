# Task 0.2 — ComponentConfig<Props> Interface

Purpose: define the shape of Puck component configuration and show how fields, defaults, and render functions map into typed props for Hero, Card, and Grid examples.

## ComponentConfig Core Types

```typescript
import { ComponentConfig, Config } from '@measured/puck';

type FieldOption<T> = { label: string; value: T };

type StandardField =
  | { type: 'text'; label?: string; placeholder?: string }
  | { type: 'textarea'; label?: string; placeholder?: string }
  | { type: 'number'; label?: string; min?: number; max?: number; step?: number }
  | { type: 'select'; label?: string; options: FieldOption<string | number | boolean>[] }
  | { type: 'radio'; label?: string; options: FieldOption<string | number | boolean>[] }
  | { type: 'checkbox'; label?: string };

type AdvancedField =
  | { type: 'slot'; label?: string; allowedComponents?: string[]; max?: number }
  | { type: 'inline'; label?: string; toolbar?: string[] }
  | { type: 'external'; label?: string; source: string }
  | { type: 'array'; label?: string; arrayFields: Record<string, StandardField | AdvancedField>; defaultItemProps?: Record<string, unknown> };

export type Field = StandardField | AdvancedField;

export interface ComponentConfig<Props> {
  fields: Record<keyof Props & string, Field>;
  defaultProps: Props;
  render: (props: Props) => React.ReactNode;
  label?: string;
  category?: string;
  icon?: string;
  description?: string;
}

export type Components = Record<string, ComponentConfig<any>>;
export type PuckConfig = Config<Components>;
```

## Example: HeroBlock (text + inline)

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

export const HeroBlock: ComponentConfig<HeroProps> = {
  label: 'Hero',
  category: 'Content',
  icon: '🎯',
  fields: {
    id: { type: 'text', label: 'ID' },
    title: { type: 'inline', label: 'Headline', toolbar: ['bold', 'italic', 'link'] },
    subtitle: { type: 'inline', label: 'Subhead' },
    ctaText: { type: 'text', label: 'CTA Text' },
    ctaUrl: { type: 'text', label: 'CTA URL' },
    backgroundImage: { type: 'external', label: 'Background Image', source: 'mediaLibrary' },
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
    id: 'HeroBlock-1',
    title: 'Welcome to Our Site',
    subtitle: 'We build great things.',
    ctaText: 'Get Started',
    ctaUrl: '/signup',
    align: 'center',
  },
  render: ({ title, subtitle, ctaText, ctaUrl, align, backgroundImage }) => (
    <section className="relative overflow-hidden py-16">
      {backgroundImage && <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={cn('relative mx-auto max-w-4xl px-6 text-center', `text-${align}`)}>
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
        <a className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white" href={ctaUrl}>
          {ctaText}
        </a>
      </div>
    </section>
  ),
};
```

## Example: CardBlock (fields + defaults)

```typescript
interface CardProps {
  id: string;
  title: string;
  body: string;
  image?: string;
  variant: 'default' | 'outline';
}

export const CardBlock: ComponentConfig<CardProps> = {
  label: 'Card',
  category: 'Content',
  icon: '🧩',
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
  },
  defaultProps: {
    id: 'CardBlock-1',
    title: 'Card Title',
    body: 'Card body copy goes here.',
    variant: 'default',
  },
  render: ({ title, body, image, variant }) => (
    <div className={cn('rounded-lg border p-6 shadow-sm', variant === 'outline' && 'border-dashed')}>
      {image && <img src={image} alt="" className="mb-4 h-40 w-full rounded-md object-cover" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  ),
};
```

## Example: GridBlock (Slot field)

```typescript
interface GridProps {
  id: string;
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg' | 'xl';
  items: { type: string; props: Record<string, unknown> }[];
}

export const GridBlock: ComponentConfig<GridProps> = {
  label: 'Grid',
  category: 'Layout',
  icon: '🔲',
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
      allowedComponents: ['CardBlock', 'ImageBlock', 'TextBlock'],
      max: 12,
    },
  },
  defaultProps: {
    id: 'GridBlock-1',
    columns: 3,
    gap: 'md',
    items: [],
  },
  render: ({ columns, gap, items }) => (
    <div className={cn('grid', `grid-cols-${columns}`, `gap-${gap}`)}>
      {items.map((item, index) => (
        <div key={index}>{/* Puck renders nested component here */}</div>
      ))}
    </div>
  ),
};
```

## Notes

- Interfaces align with Puck 0.19.3 (`frontend/widget` current dependency); inline/Slot examples keep forward compatibility with 0.20.x.
- Use `Fields` definitions to drive both editor sidebar config and TypeScript prop inference across primitives/blocks.
- Acceptance: includes interface definition and three complete examples (Hero, Card, Grid) showing fields, defaults, and render usage per Task 0.2.
