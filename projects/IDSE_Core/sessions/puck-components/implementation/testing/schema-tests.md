# Task 2.3 — Schema Validation Tests (Zod)

Purpose: Validate props and PageData shapes at runtime using Zod schemas to prevent malformed imports/renders.

## Patterns
- Use Zod schemas from `implementation/zod-schemas.md` for props.
- Compose a `PageDataSchema` for nested Slot trees (Grid with Card items).
- Use `safeParse` in tests to assert success/failure on fixtures.

## Example: Grid + Card PageData schema
```typescript
import { z } from "zod";
import { GridPropsSchema, CardPropsSchema } from "@/puck/components/zod-schemas"; // adjust import path when implemented

const CardNodeSchema = z.object({
  component: z.literal("CardBlock"),
  props: CardPropsSchema,
});

const GridNodeSchema = z.object({
  component: z.literal("GridBlock"),
  props: GridPropsSchema.extend({
    items: z.array(CardNodeSchema),
  }),
});

export const PageDataSchema = z.object({
  content: z.array(GridNodeSchema),
});
```

## Test example (Vitest)
```typescript
import { describe, it, expect } from "vitest";
import { PageDataSchema } from "./PageDataSchema"; // from above

const validFixture = {
  content: [
    {
      component: "GridBlock",
      props: {
        id: "grid_1",
        columns: 3,
        gap: "md",
        items: [
          { component: "CardBlock", props: { id: "card_1", title: "One", body: "Body", variant: "default" } },
        ],
      },
    },
  ],
};

describe("PageData schema", () => {
  it("accepts valid fixture", () => {
    const result = PageDataSchema.safeParse(validFixture);
    expect(result.success).toBe(true);
  });

  it("rejects missing ids", () => {
    const bad = { ...validFixture, content: [{ ...validFixture.content[0], props: { ...validFixture.content[0].props, id: "" } }] };
    const result = PageDataSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
```

## Notes
- Keep schemas aligned with ComponentConfig props; update tests on prop changes.
- Use schema validation in import flows (see `pagedata-importer.md`) to surface errors to editors.
