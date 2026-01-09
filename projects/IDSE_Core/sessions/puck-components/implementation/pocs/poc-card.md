# POC: CardBlock Prototype (CardBlock inside GridBlock with Inline Edit)

Purpose

Create a focused proof-of-concept demonstrating key integration points: Slot nesting, inline editing (FieldTransforms), Storybook story, and a PageData round-trip test. This POC validates assumptions in the spec and reduces risk before full component implementation.

Scope (documentation-only)

- Describe the minimal CardBlock and GridBlock configuration for Puck.
- Provide Storybook CSF3 story templates (editor/preview modes).
- Provide a Jest test outline for PageData serialize → deserialize → render round-trip.
- Include acceptance criteria and expected outputs (docs, story, test examples).

Prerequisites

- Reference TypeScript interfaces: RootData, ComponentData, PageData (see implementation/typescript-interfaces.md)
- Storybook + Jest tooling available per Technical Environment

Storybook (CSF3) example (concrete snippet)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CardBlock } from '../blocks/card';
import { GridBlock } from '../blocks/grid';
import { PuckProvider } from '@measured/puck/react'; // adjust if different in repo

const meta: Meta = { title: 'POC/CardBlock', component: CardBlock };
export default meta;
type Story = StoryObj;

const gridConfig = {/* ComponentConfig from blocks/grid.md */};
const cardConfig = {/* ComponentConfig from blocks/card.md */};

const pageData = {
  content: [
    {
      component: 'GridBlock',
      props: {
        id: 'grid_1',
        columns: 3,
        gap: 'md',
        items: [
          {
            component: 'CardBlock',
            props: {
              id: 'card_1',
              title: 'Card One',
              body: 'Card one body content.',
              variant: 'default',
            },
          },
          {
            component: 'CardBlock',
            props: {
              id: 'card_2',
              title: 'Card Two',
              body: 'Card two body content.',
              variant: 'outline',
            },
          },
        ],
      },
    },
  ],
};

export const Editor: Story = {
  decorators: [
    (Story) => (
      <PuckProvider
        config={{ components: { CardBlock: cardConfig, GridBlock: gridConfig } }}
        registerOverlayPortal={() => {}}
      >
        <Story />
      </PuckProvider>
    ),
  ],
  render: () => (
    <GridBlock.render {...pageData.content[0].props} />
  ),
};

export const Preview: Story = {
  render: () => (
    <GridBlock.render {...pageData.content[0].props} />
  ),
};
```

Jest test outline (concrete snippet)

```typescript
import { importPageData, exportPageData } from '../pagedata-api';
import { GridPropsSchema, CardPropsSchema } from '../zod-schemas';
import { z } from 'zod';

const CardNodeSchema = z.object({
  component: z.literal('CardBlock'),
  props: CardPropsSchema,
});

const GridNodeSchema = z.object({
  component: z.literal('GridBlock'),
  props: GridPropsSchema,
});

const PageDataSchema = z.object({
  content: z.array(z.union([GridNodeSchema, CardNodeSchema])),
});

const fixture = {
  content: [
    {
      component: 'GridBlock',
      props: {
        id: 'grid_1',
        columns: 3,
        gap: 'md',
        items: [
          { component: 'CardBlock', props: { id: 'card_1', title: 'One', body: 'Body', variant: 'default' } },
          { component: 'CardBlock', props: { id: 'card_2', title: 'Two', body: 'Body', variant: 'outline' } },
        ],
      },
    },
  ],
};

describe('POC CardBlock PageData round-trip', () => {
  it('validates and round-trips PageData', () => {
    const imported = importPageData(JSON.stringify(fixture), PageDataSchema);
    expect(imported.content[0].props.items[0].props.id).toBe('card_1');

    const json = exportPageData(imported);
    const parsed = importPageData(json, PageDataSchema);
    expect(parsed.content[0].props.items).toHaveLength(2);
  });
});
```

Acceptance criteria

- Storybook: Editor and Preview stories render without runtime errors in docs environment.
- Test: Round-trip serialize/deserialize passes schema validation (Zod) and retains component ids and props for the POC nodes.
- Docs: `implementation/pocs/poc-card.md` documents the example, story templates, and test outlines so an engineer can implement the prototype quickly.

Next steps for implementer

1. Implement CardBlock ComponentConfig example in implementation/blocks/card-block.md as a small example.
2. Add Storybook stories using the templates above and run storybook build.
3. Implement Jest round-trip test using PageData fixture from spec.
4. Report results and update spec/tasks with any discovered deviations.

Updated POC specifics (aligned with current docs)

- ComponentConfig: use `blocks/card.md` example (variant + optional image/CTA) and nest inside `blocks/grid.md` Slot for the POC layout.
- Stories: Editor story should register overlay portal stub (for Radix portals) and include the safelist-driven Tailwind classes used by GridBlock (`grid-cols-*`, `gap-*`) to mirror production render.
- Test: Use `importPageData` + `exportPageData` signatures from `implementation/pagedata-api.md`, validating with `GridPropsSchema`/`CardPropsSchema` from `implementation/zod-schemas.md`. Ensure `props.id` is preserved for each nested card.
