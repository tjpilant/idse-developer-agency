# Pattern: Shared Schema for Puck + Storybook Components

**Status**: ⭐ Pattern documentation
**Phase**: Cross-cutting pattern (applies to Phase 1+ components)
**Related Tasks**: All primitive/block component tasks (1.1-1.21)
**Spec Reference**: [spec.md](../../specs/spec.md) (FR-2.3: Component configuration API)
**Plan Reference**: [plan.md](../../plans/plan.md) (Component API contracts section)

---

## Problem Statement

When building Puck components with CVA (Class Variance Authority) for variant management, developers must manually maintain **five separate sources of truth**:

1. **CVA variant definitions** (component source code)
2. **Tailwind class mappings** (component styling - often inline with CVA)
3. **Puck field configurations** (Puck config objects)
4. **Storybook argTypes** (story files for interactive controls)
5. **Tailwind safelist entries** (tailwind.safelist.txt for dynamic classes)

This violates the DRY (Don't Repeat Yourself) principle and creates maintenance burden:

- Adding a new variant requires updating 5+ locations
- Renaming a variant risks inconsistencies
- Type safety is not enforced across all layers
- Missing safelist entries cause Tailwind to purge dynamic classes
- **CRITICAL BUG**: Missing argTypes results in empty Storybook controls (see [Existing POC Issues](#existing-poc-issues))

---

## Solution: CVA as Single Source of Truth

Use **CVA variant definitions** as the canonical source, then **auto-generate** all derivative configurations:

```
CVA Variants (button.config.ts)
    ↓
├─→ Tailwind Classes (Record<Variant, string> with exhaustiveness checking)
├─→ Puck Fields (auto-generated field definitions)
├─→ Storybook ArgTypes (auto-generated interactive controls)
└─→ Safelist Entries (auto-updated tailwind.safelist.txt)
```

---

## Complete Implementation Pattern

### Step 1: Define CVA Variants with Tailwind Mapping

Create a shared configuration file that defines variants and their Tailwind class mappings with **TypeScript exhaustiveness checking**.

**File**: `src/puck/components/button.config.ts` (example)

```typescript
import { cva, type VariantProps } from "class-variance-authority";

// Define CVA variants (single source of truth)
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Explicit Tailwind class mappings with TypeScript exhaustiveness
// Record<> enforces that all variant keys have corresponding Tailwind classes
export const buttonIntentClasses: Record<NonNullable<VariantProps<typeof buttonVariants>["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

export const buttonSizeClasses: Record<NonNullable<VariantProps<typeof buttonVariants>["size"]>, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8",
  icon: "h-9 w-9",
};

// TypeScript will error if we add a new CVA variant but forget to add its Tailwind mapping!
// Example: If we add `variant: "warning"` to CVA but forget buttonIntentClasses.warning,
// TypeScript will show: Property 'warning' is missing in type...
```

**Benefits of Record<> Pattern**:
- **Exhaustiveness checking**: Adding `variant: "warning"` to CVA requires adding `buttonIntentClasses.warning`
- **Autocomplete**: IDEs show all available variants when writing Tailwind classes
- **Refactoring safety**: Renaming a variant updates type requirements everywhere
- **Self-documenting**: Clear mapping between variant keys and Tailwind utility classes

---

### Step 2: Auto-Generate Puck Fields from CVA

Create a utility to derive Puck field configurations from CVA variant definitions.

**File**: `src/puck/utils/cva-to-puck.ts`

```typescript
import type { Field } from "@measured/puck";
import type { VariantProps } from "class-variance-authority";

type CVAVariants = Record<string, Record<string, any>>;

/**
 * Auto-generates Puck field definitions from CVA variants
 *
 * @example
 * const fields = cvaVariantsToPuckFields(buttonVariants, {
 *   variant: { label: "Style" },
 *   size: { label: "Size" }
 * });
 */
export function cvaVariantsToPuckFields<T extends CVAVariants>(
  cvaConfig: { variants: T },
  fieldOverrides: Partial<Record<keyof T, { label?: string; type?: string }>> = {}
): Record<keyof T, Field> {
  const fields: Record<string, Field> = {};

  for (const [variantName, variantOptions] of Object.entries(cvaConfig.variants)) {
    const override = fieldOverrides[variantName] || {};
    const options = Object.keys(variantOptions).map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
      value: key,
    }));

    fields[variantName] = {
      type: override.type || "radio", // default to radio for variants
      label: override.label || variantName.charAt(0).toUpperCase() + variantName.slice(1),
      options,
    };
  }

  return fields as Record<keyof T, Field>;
}
```

**Usage in Puck Config**:

```typescript
import { ComponentConfig } from "@measured/puck";
import { buttonVariants } from "./button.config";
import { cvaVariantsToPuckFields } from "@/puck/utils/cva-to-puck";

export type ButtonProps = {
  id: string;
  text: string;
  variant: VariantProps<typeof buttonVariants>["variant"];
  size: VariantProps<typeof buttonVariants>["size"];
};

export const ButtonBlock: ComponentConfig<ButtonProps> = {
  label: "Button",
  fields: {
    text: { type: "text", label: "Button Text" },
    // Auto-generate variant and size fields from CVA
    ...cvaVariantsToPuckFields(buttonVariants, {
      variant: { label: "Button Style", type: "select" },
      size: { label: "Button Size" },
    }),
  },
  defaultProps: {
    id: "button_1",
    text: "Click me",
    variant: "default",
    size: "default",
  },
  render: ({ text, variant, size }) => (
    <button className={buttonVariants({ variant, size })}>
      {text}
    </button>
  ),
};
```

---

### Step 3: Auto-Generate Storybook ArgTypes from CVA

Create a utility to derive Storybook argTypes from CVA variants.

**File**: `src/puck/utils/cva-to-storybook.ts`

```typescript
import type { ArgTypes } from "@storybook/react";

type CVAVariants = Record<string, Record<string, any>>;

/**
 * Auto-generates Storybook argTypes from CVA variants
 *
 * @example
 * const argTypes = cvaVariantsToArgTypes(buttonVariants);
 * // Returns:
 * // {
 * //   variant: { control: "radio", options: ["default", "destructive", ...] },
 * //   size: { control: "radio", options: ["default", "sm", "lg", "icon"] }
 * // }
 */
export function cvaVariantsToArgTypes<T extends CVAVariants>(
  cvaConfig: { variants: T },
  controlOverrides: Partial<Record<keyof T, "radio" | "select" | "inline-radio">> = {}
): ArgTypes {
  const argTypes: ArgTypes = {};

  for (const [variantName, variantOptions] of Object.entries(cvaConfig.variants)) {
    const options = Object.keys(variantOptions);
    const control = controlOverrides[variantName] || "radio";

    argTypes[variantName] = {
      control,
      options,
      description: `${variantName.charAt(0).toUpperCase() + variantName.slice(1)} variant`,
    };
  }

  return argTypes;
}
```

**Usage in Storybook Stories**:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ButtonBlock, type ButtonProps } from "../Button";
import { buttonVariants } from "../button.config";
import { cvaVariantsToArgTypes } from "@/puck/utils/cva-to-storybook";

const ButtonWrapper = (args: ButtonProps) => <>{ButtonBlock.render(args)}</>;

const meta: Meta<typeof ButtonWrapper> = {
  title: "Blocks/Button",
  component: ButtonWrapper,
  // Auto-generate argTypes from CVA (fixes empty controls issue!)
  argTypes: {
    text: { control: "text" },
    ...cvaVariantsToArgTypes(buttonVariants, {
      variant: "select", // Override default radio with select dropdown
      size: "radio",
    }),
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonWrapper>;

export const Default: Story = {
  args: {
    id: "button_1",
    text: "Click me",
    variant: "default",
    size: "default",
  },
};

export const Destructive: Story = {
  args: {
    ...Default.args,
    text: "Delete",
    variant: "destructive",
  },
};
```

**Result**: Storybook now has fully interactive controls for `variant` and `size` - no more empty controls panel!

---

### Step 4: Auto-Update Safelist from CVA

Create a utility to extract dynamic Tailwind classes from CVA variants for safelist.

**File**: `src/puck/utils/cva-to-safelist.ts`

```typescript
/**
 * Extracts Tailwind classes from CVA variant mappings for safelist
 *
 * @example
 * const safelistClasses = cvaVariantsToSafelist(buttonIntentClasses, buttonSizeClasses);
 * // Returns: ["bg-primary", "text-primary-foreground", "hover:bg-primary/90", ...]
 */
export function cvaVariantsToSafelist(
  ...classMappings: Record<string, string>[]
): string[] {
  const classes = new Set<string>();

  for (const mapping of classMappings) {
    for (const classString of Object.values(mapping)) {
      // Split class strings and add to set (deduplication)
      classString.split(" ").forEach((cls) => {
        if (cls.trim()) classes.add(cls.trim());
      });
    }
  }

  return Array.from(classes).sort();
}
```

**Integration with tailwind.safelist.txt**:

```typescript
// scripts/update-safelist.ts (run during build or manually)
import { writeFileSync } from "fs";
import { buttonIntentClasses, buttonSizeClasses } from "@/puck/components/button.config";
import { cvaVariantsToSafelist } from "@/puck/utils/cva-to-safelist";

const buttonSafelist = cvaVariantsToSafelist(buttonIntentClasses, buttonSizeClasses);

// Read existing safelist
const existingSafelist = readFileSync("frontend/widget/tailwind.safelist.txt", "utf-8")
  .split("\n")
  .filter(Boolean);

// Merge and deduplicate
const mergedSafelist = Array.from(new Set([...existingSafelist, ...buttonSafelist])).sort();

writeFileSync("frontend/widget/tailwind.safelist.txt", mergedSafelist.join("\n"));

console.log(`Updated safelist with ${buttonSafelist.length} button classes`);
```

**Manual Safelist Update** (current approach per [tailwind-strategy.md](../tailwind-strategy.md)):

Add CVA-derived classes directly to `frontend/widget/tailwind.safelist.txt`:

```txt
# Button variant classes (auto-extracted from buttonIntentClasses + buttonSizeClasses)
bg-primary
text-primary-foreground
hover:bg-primary/90
bg-destructive
text-destructive-foreground
hover:bg-destructive/90
border
border-input
hover:bg-accent
hover:text-accent-foreground
bg-secondary
text-secondary-foreground
hover:bg-secondary/80
text-primary
underline-offset-4
hover:underline
h-9
px-4
py-2
h-8
px-3
text-xs
h-10
px-8
w-9
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ button.config.ts (Single Source of Truth)                      │
│ - buttonVariants (CVA)                                          │
│ - buttonIntentClasses (Record<Variant, Tailwind Classes>)      │
│ - buttonSizeClasses (Record<Size, Tailwind Classes>)           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─→ Component (button.tsx)
             │   - Uses buttonVariants({ variant, size })
             │   - TypeScript enforces valid variant/size values
             │
             ├─→ Puck Config (Button.ts)
             │   - cvaVariantsToPuckFields(buttonVariants)
             │   - Auto-generates field definitions with options
             │
             ├─→ Storybook Stories (button.stories.tsx)
             │   - cvaVariantsToArgTypes(buttonVariants)
             │   - Auto-generates interactive controls
             │
             └─→ Tailwind Safelist (tailwind.safelist.txt)
                 - cvaVariantsToSafelist(buttonIntentClasses, buttonSizeClasses)
                 - Auto-updates safelist with dynamic classes
```

---

## Existing POC Issues and Fixes

### Issue: Empty Storybook Controls

**Problem**: POC stories created in Phase 0-1 are missing `argTypes`, resulting in an empty Storybook controls panel.

**Affected Files**:
- [frontend/widget/src/puck/components/__stories__/card.poc.stories.tsx](../../../frontend/widget/src/puck/components/__stories__/card.poc.stories.tsx)
- [frontend/widget/src/puck/components/__stories__/grid-with-cards.poc.stories.tsx](../../../frontend/widget/src/puck/components/__stories__/grid-with-cards.poc.stories.tsx)

---

### Fix 1: Card POC Story

**BEFORE** (empty controls):

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card, type CardProps } from "../Card";

const CardWrapper = (args: CardProps) => <>{Card.render(args)}</>;

const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  parameters: {
    controls: { expanded: true },
  },
  // ❌ MISSING: argTypes definition - Storybook can't infer controls
};

export default meta;
type Story = StoryObj<typeof CardWrapper>;

export const Preview: Story = {
  args: {
    title: "Card One",
    description: "Card body content.",
    icon: "✅",
  },
};
```

**AFTER** (with manual argTypes):

```typescript
const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  argTypes: {
    title: { control: "text", description: "Card title" },
    description: { control: "text", description: "Card body content" },
    icon: { control: "text", description: "Icon (emoji or URL)" },
  },
  parameters: {
    controls: { expanded: true },
  },
};
```

**AFTER** (with CVA auto-generation - future enhancement):

If Card component uses CVA for variants (e.g., `variant: "elevated" | "outlined" | "flat"`):

```typescript
import { cardVariants } from "../card.config"; // CVA config
import { cvaVariantsToArgTypes } from "@/puck/utils/cva-to-storybook";

const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
    ...cvaVariantsToArgTypes(cardVariants), // Auto-generate variant controls
  },
};
```

---

### Fix 2: Grid with Cards POC Story

**BEFORE** (empty controls for `columns` and `gap`):

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { GridBlock } from "../Grid";
import { Card } from "../Card";

type GridStoryProps = {
  columns: 1 | 2 | 3 | 4;
  gap: "sm" | "md" | "lg" | "xl";
};

const GridWithCards = ({ columns, gap }: GridStoryProps) => {
  const items = [
    Card.render({ id: "card_1", title: "Card One", description: "Body", icon: "✅" }),
    Card.render({ id: "card_2", title: "Card Two", description: "Body", icon: "⭐" }),
    Card.render({ id: "card_3", title: "Card Three", description: "Body", icon: "🔥" }),
  ];

  return <>{GridBlock.render({ id: "grid_1", columns, gap, items })}</>;
};

const meta: Meta<typeof GridWithCards> = {
  title: "POC/GridWithCards",
  component: GridWithCards,
  args: {
    columns: 3,
    gap: "md",
  },
  // ❌ MISSING: argTypes - Storybook shows text inputs instead of select/radio
};
```

**AFTER** (with manual argTypes):

```typescript
const meta: Meta<typeof GridWithCards> = {
  title: "POC/GridWithCards",
  component: GridWithCards,
  argTypes: {
    columns: {
      control: "select",
      options: [1, 2, 3, 4],
      description: "Number of grid columns",
    },
    gap: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Grid gap size",
    },
  },
  args: {
    columns: 3,
    gap: "md",
  },
};
```

**AFTER** (with CVA auto-generation):

```typescript
import { gridVariants } from "../grid.config"; // CVA config for columns/gap
import { cvaVariantsToArgTypes } from "@/puck/utils/cva-to-storybook";

const meta: Meta<typeof GridWithCards> = {
  title: "POC/GridWithCards",
  component: GridWithCards,
  argTypes: cvaVariantsToArgTypes(gridVariants, {
    columns: "select", // Use dropdown instead of default radio
    gap: "radio",
  }),
  args: {
    columns: 3,
    gap: "md",
  },
};
```

---

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | CVA variants define all derivative configurations |
| **Type Safety** | `Record<>` enforces exhaustiveness - adding variant requires Tailwind mapping |
| **Autocomplete** | IDEs show available variants when writing Tailwind classes |
| **Refactoring Safety** | Renaming a variant updates type requirements across all layers |
| **No Missing Safelist** | Auto-generated safelist prevents Tailwind purging dynamic classes |
| **Storybook Controls** | Auto-generated argTypes fix empty controls panel issue |
| **DRY Compliance** | Zero duplication - update CVA once, all outputs regenerate |
| **Onboarding Speed** | New developers understand variant system from single config file |

---

## Implementation Checklist

For each Puck component with variants:

- [ ] Define CVA variants in `[component].config.ts`
- [ ] Create explicit Tailwind class mappings with `Record<>` for exhaustiveness
- [ ] Use `cvaVariantsToPuckFields()` in Puck config
- [ ] Use `cvaVariantsToArgTypes()` in Storybook stories
- [ ] Add CVA-derived classes to `tailwind.safelist.txt` (manual or scripted)
- [ ] Verify Storybook controls work (all variants should have interactive controls)
- [ ] Verify TypeScript errors if variant is added without Tailwind mapping

---

## Related Documentation

- **CVA Setup**: [primitives/cn-utility.md](../primitives/cn-utility.md) (cn() helper with clsx + tailwind-merge)
- **Puck Fields**: [component-config-api.md](../component-config-api.md) (field type reference)
- **Storybook Setup**: [testing/storybook-specs.md](../testing/storybook-specs.md) (CSF3 patterns)
- **Tailwind Strategy**: [tailwind-strategy.md](../tailwind-strategy.md) (safelist approach, OQ-1 resolution)
- **TypeScript Patterns**: [typescript-interfaces.md](../typescript-interfaces.md) (PageData, ComponentConfig types)

---

## Migration Guide

To migrate an existing component to this pattern:

1. **Extract CVA variants** from component source to `[component].config.ts`
2. **Add Tailwind mappings** with `Record<>` for type safety
3. **Replace manual Puck fields** with `cvaVariantsToPuckFields()`
4. **Add argTypes to stories** using `cvaVariantsToArgTypes()`
5. **Update safelist** with CVA-derived classes
6. **Test**: Verify Storybook controls work and Tailwind classes render correctly

---

## Production Readiness Notes

**Per IDSE Article X**: This document contains **illustrative code examples** to demonstrate the pattern. Production implementation should:

1. Create utilities in `frontend/widget/src/puck/utils/` (cva-to-puck.ts, cva-to-storybook.ts, cva-to-safelist.ts)
2. Refactor existing components to use shared config pattern (Button, Card, Grid, etc.)
3. Fix POC stories with argTypes (card.poc.stories.tsx, grid-with-cards.poc.stories.tsx)
4. Add safelist automation script or document manual process in [tailwind-strategy.md](../tailwind-strategy.md)
5. Update [testing/storybook-specs.md](../testing/storybook-specs.md) with auto-generation pattern as standard practice

**Validation**: Run `npm run storybook` and verify all controls are interactive, no empty panels.

---

**Document Version**: 1.0
**Last Updated**: 2026-01-02 (Phase 3, shared schema pattern addition)
**Owner**: IDSE Developer Agency (Claude) → Production Implementation Team
