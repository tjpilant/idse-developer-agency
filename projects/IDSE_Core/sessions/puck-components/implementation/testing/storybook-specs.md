# Task 2.2 — Storybook Story Specifications (CSF3)

Purpose: Document how to structure stories for Puck components/blocks and use controls to mirror Puck field props.

## Patterns
- Use `args` to mirror Puck `ComponentConfig` props (e.g., `title`, `subtitle`, `columns`, `gap`).
- For Slot components, pass nested renders in the story (or mock PuckProvider) to demonstrate Slot content.
- Keep stories in `frontend/widget/src/puck/components/__stories__/`.

## Example: CardBlock story with controls
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card, type CardProps } from "../Card";

const CardWrapper = (args: CardProps) => <>{Card.render(args)}</>;

const meta: Meta<typeof CardWrapper> = {
  title: "Blocks/Card",
  component: CardWrapper,
  args: {
    title: "Card One",
    description: "Body text",
    icon: "✅",
  },
};

export default meta;
export const Default: StoryObj<typeof CardWrapper> = {};
```

## Example: Grid + Card Slot story
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { GridBlock } from "../Grid";
import { Card } from "../Card";

type GridStoryProps = {
  columns: 1 | 2 | 3 | 4;
  gap: "sm" | "md" | "lg" | "xl";
};

const GridStory = ({ columns, gap }: GridStoryProps) => (
  <>
    {GridBlock.render({
      id: "grid_1",
      columns,
      gap,
      items: [
        Card.render({ id: "card_1", title: "One", description: "Body", icon: "✅" }),
        Card.render({ id: "card_2", title: "Two", description: "Body", icon: "⭐" }),
      ],
    })}
  </>
);

const meta: Meta<typeof GridStory> = {
  title: "Blocks/GridWithCards",
  component: GridStory,
  args: {
    columns: 3,
    gap: "md",
  },
};

export default meta;
export const Default: StoryObj<typeof GridStory> = {};
```

## Auto-Generating ArgTypes from CVA (Shared Schema Pattern)

**⭐ CRITICAL FIX**: POC stories created in Phase 0-1 are missing `argTypes`, resulting in **empty Storybook controls**. This issue is addressed by the shared schema pattern.

See: [patterns/shared-schema-pattern.md](../patterns/shared-schema-pattern.md) for complete guide.

### Problem: Empty Storybook Controls

**BEFORE** (missing argTypes):

```typescript
const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  // ❌ MISSING argTypes - Storybook can't create interactive controls
};
```

**Result**: Controls panel is empty, users can't interact with component props.

### Solution: Auto-Generate from CVA Variants

**AFTER** (with shared schema pattern):

```typescript
import { cardVariants } from "../card.config"; // CVA config
import { cvaVariantsToArgTypes } from "@/puck/utils/cva-to-storybook";

const meta: Meta<typeof CardWrapper> = {
  title: "Blocks/Card",
  component: CardWrapper,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
    ...cvaVariantsToArgTypes(cardVariants), // ✅ Auto-generated controls for CVA variants
  },
};
```

**Result**: Fully interactive controls for all props, including CVA variants.

### Utility Implementation

```typescript
// src/puck/utils/cva-to-storybook.ts
import type { ArgTypes } from "@storybook/react";

export function cvaVariantsToArgTypes<T extends Record<string, Record<string, any>>>(
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

### Fixing Existing POC Stories

**Card POC** ([frontend/widget/src/puck/components/__stories__/card.poc.stories.tsx](../../frontend/widget/src/puck/components/__stories__/card.poc.stories.tsx)):

```typescript
// Add argTypes manually or use cvaVariantsToArgTypes() if Card has CVA variants
const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  argTypes: {
    title: { control: "text", description: "Card title" },
    description: { control: "text", description: "Card body content" },
    icon: { control: "text", description: "Icon (emoji or URL)" },
  },
};
```

**Grid+Cards POC** ([frontend/widget/src/puck/components/__stories__/grid-with-cards.poc.stories.tsx](../../frontend/widget/src/puck/components/__stories__/grid-with-cards.poc.stories.tsx)):

```typescript
// Add argTypes for columns and gap controls
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
};
```

---

## Notes
- Use `parameters.layout = "fullscreen"` for page-level layouts.
- For overlay/portal components (tooltip/popover), add decorators to register overlay portals or mock Puck provider if needed.
- Safelist must include any dynamic classes referenced by stories (grid/gap/alignment) to ensure Storybook CSS matches Puck builds.
- **⭐ ALWAYS add argTypes** to stories to enable interactive controls - use shared schema pattern for CVA components (see [patterns/shared-schema-pattern.md](../patterns/shared-schema-pattern.md)).
