# Composition: PageDataImporter (Task 1.22)

Purpose: Parse and validate PageData JSON into typed structures before rendering or storing. Pairs with `exportPageData` from Phase 0.

## API Signature (doc example)
```typescript
import { z } from "zod";
import { Data } from "./typescript-interfaces"; // Phase 0 interfaces

type ImportResult<T> = { data: Data<T>; errors?: string[] };

export function importPageData<T>(
  json: string,
  schema?: z.ZodSchema
): ImportResult<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    return { data: {} as Data<T>, errors: [`Invalid JSON: ${(error as Error).message}`] };
  }

  if (!schema) return { data: parsed as Data<T> };

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return { data: {} as Data<T>, errors };
  }
  return { data: result.data };
}
```

## Usage Pattern
- Provide a `PageDataSchema` built from Zod schemas in `zod-schemas.md` (e.g., GridPropsSchema + CardPropsSchema).
- Fail fast on JSON parse; return errors list for UI display (editor notifications).
- In production, hook into upload/import UI to show validation errors inline.

## Example (Grid + Card)
```typescript
const PageDataSchema = z.object({
  content: z.array(
    z.object({
      component: z.literal("GridBlock"),
      props: GridPropsSchema.extend({
        items: z.array(
          z.object({
            component: z.literal("CardBlock"),
            props: CardPropsSchema,
          })
        ),
      }),
    })
  ),
});

const result = importPageData(JSON.stringify(fixture), PageDataSchema);
if (result.errors?.length) {
  // Surface errors in UI
}
```

## Notes
- Keep schemas in sync with ComponentConfig definitions; update both when props change.
- Surface path + message to editors (`content.0.props.items.1.props.title: Title is required`).
- No production code here; actual importer lives in `frontend/widget/src/` with proper error handling and telemetry.
