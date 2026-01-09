# Primitive: Button (Task 1.1)

Reference implementation: `frontend/widget/src/components/ui/button.tsx` (shadcn-style Radix Slot + cva variants).

## Purpose
- Provide a versatile clickable primitive with size/variant tokens aligned to shadcn patterns.
- Serve as the base for CTA buttons in HeroBlock/CardBlock/ButtonGroupBlock.

## Props / Variants
- `variant`: `default | destructive | outline | secondary | ghost | link` (default: `default`)
- `size`: `default | sm | lg | icon` (default: `default`)
- `asChild`: optional Radix Slot usage to render as a different element.
- Other button HTML attributes (`type`, `disabled`, etc.).

## ComponentConfig Example

```typescript
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  id: string;
  label: string;
  href?: string;
  variant: ButtonVariant;
  size: ButtonSize;
}

export const ButtonPrimitive: ComponentConfig<ButtonProps> = {
  label: 'Button',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    label: { type: 'text', label: 'Label' },
    href: { type: 'text', label: 'Href (optional)' },
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
  defaultProps: {
    id: 'Button-1',
    label: 'Click me',
    variant: 'default',
    size: 'default',
  },
  render: ({ label, href, variant, size }) => (
    <Button asChild={!!href} variant={variant} size={size}>
      {href ? <a href={href}>{label}</a> : label}
    </Button>
  ),
};
```

## Usage Example

```tsx
import { Button } from "@/components/ui/button";

export function ButtonDemo() {
  return (
    <div className="flex gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive" size="sm">Delete</Button>
      <Button variant="secondary" size="icon" aria-label="More">
        ⋯
      </Button>
    </div>
  );
}
```

## Shared Schema Pattern (DRY Best Practice)

**⭐ RECOMMENDED**: Use the shared schema pattern to auto-generate Puck fields and Storybook argTypes from CVA variants, eliminating duplication and ensuring type safety.

See: [patterns/shared-schema-pattern.md](../patterns/shared-schema-pattern.md) for complete implementation guide.

**Benefits**:
- Single source of truth (CVA variants)
- Auto-generate Puck fields with `cvaVariantsToPuckFields(buttonVariants)`
- Auto-generate Storybook argTypes with `cvaVariantsToArgTypes(buttonVariants)`
- TypeScript exhaustiveness checking with `Record<Variant, string>` for Tailwind classes
- Automatic safelist updates (no purged dynamic classes)

**Example with Shared Schema**:

```typescript
// button.config.ts (single source of truth)
import { cva } from "class-variance-authority";

export const buttonVariants = cva(/* ... existing CVA config ... */);

export const buttonIntentClasses: Record</* ... */> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  // ... TypeScript enforces exhaustiveness
};

// Button.ts (Puck config - auto-generated fields)
import { cvaVariantsToPuckFields } from "@/puck/utils/cva-to-puck";

export const ButtonPrimitive: ComponentConfig<ButtonProps> = {
  fields: {
    ...cvaVariantsToPuckFields(buttonVariants, {
      variant: { label: "Button Style", type: "select" },
      size: { label: "Button Size" },
    }),
  },
  // ...
};

// button.stories.tsx (auto-generated argTypes)
import { cvaVariantsToArgTypes } from "@/puck/utils/cva-to-storybook";

const meta: Meta<typeof ButtonWrapper> = {
  argTypes: cvaVariantsToArgTypes(buttonVariants),
  // ...
};
```

---

## Notes
- Tailwind tokens come from cva in `buttonVariants`; ensure safelist covers dynamic classes if variants expand (see [tailwind-strategy.md](../tailwind-strategy.md)).
- Shared schema pattern automates safelist generation from CVA variants (see [patterns/shared-schema-pattern.md](../patterns/shared-schema-pattern.md)).
- Keeps focus-visible ring and disabled states consistent with other primitives.
- Use `asChild` when nesting inside links or custom elements to avoid invalid DOM.
