# Task 0.3 — Zod Prop Schemas (depends on Task 0.2)

Purpose: runtime validation examples for Hero, Card, and Grid props that align with ComponentConfig definitions.

```typescript
import { z } from 'zod';

// Shared helpers
const idSchema = z.string().min(1, 'id is required');
const inlineString = z.string().min(1, 'value required');
```

## HeroProps Schema

```typescript
export const HeroPropsSchema = z.object({
  id: idSchema,
  title: inlineString.max(100, 'title too long'),
  subtitle: inlineString.max(160, 'subtitle too long').optional(),
  ctaText: z.string().min(1, 'cta text required').max(30),
  ctaUrl: z.string().url('must be a valid URL'),
  backgroundImage: z.string().url('must be a valid URL').optional(),
  align: z.enum(['left', 'center', 'right']).default('center'),
});

export type HeroProps = z.infer<typeof HeroPropsSchema>;
```

## CardProps Schema

```typescript
export const CardPropsSchema = z.object({
  id: idSchema,
  title: inlineString.max(80),
  body: z.string().max(500, 'body too long'),
  image: z.string().url('must be a valid URL').optional(),
  variant: z.enum(['default', 'outline']).default('default'),
});

export type CardProps = z.infer<typeof CardPropsSchema>;
```

## GridProps Schema (Slot field)

```typescript
export const GridPropsSchema = z.object({
  id: idSchema,
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  gap: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
  items: z
    .array(
      z.object({
        type: z.string(),
        props: z.object({
          id: idSchema,
        }).passthrough(),
      })
    )
    .max(12, 'Grid supports up to 12 items'),
});

export type GridProps = z.infer<typeof GridPropsSchema>;
```

## Usage Example

```typescript
const validateGrid = (raw: unknown): GridProps => GridPropsSchema.parse(raw);

try {
  const validated = validateGrid(input);
  // safe to render or serialize
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed', error.issues);
  }
}
```

## Notes

- Schemas mirror the ComponentConfig examples in `component-config-api.md`; update both in lockstep.
- Slot validation uses a permissive `props` shape to allow nested component props but still enforces `id`.
- Inline fields are represented as strings here; WYSIWYG payloads can extend these schemas as inline editing solidifies with a future Puck 0.20.x upgrade.
