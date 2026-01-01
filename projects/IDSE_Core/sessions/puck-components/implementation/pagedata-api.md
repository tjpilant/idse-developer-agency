# Task 0.7 — PageData Import/Export API

Purpose: document signatures and error handling for serializing and parsing Puck PageData.

## Export API

```typescript
/**
 * Serialize PageData to JSON string
 * @param data - Puck Data<Components> object
 * @param prettyPrint - format JSON with indentation (default: true)
 */
export function exportPageData<T>(
  data: Data<T>,
  prettyPrint: boolean = true
): string {
  return JSON.stringify(data, null, prettyPrint ? 2 : 0);
}

// Usage
const json = exportPageData(currentPageData);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'page-data.json';
link.click();
```

## Import API

```typescript
import { z } from 'zod';

/**
 * Parse and optionally validate PageData
 * @param json - JSON string
 * @param schema - optional Zod schema for runtime validation
 */
export function importPageData<T>(
  json: string,
  schema?: z.ZodSchema
): Data<T> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }

  if (schema) {
    try {
      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
        throw new Error(`Validation failed:\n${issues.join('\n')}`);
      }
      throw error;
    }
  }

  return parsed as Data<T>;
}
```

## Round-Trip Example

```typescript
const PageDataSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      props: z.object({ id: z.string() }).passthrough(),
    })
  ),
  root: z.object({
    props: z.record(z.any()).optional(),
  }),
});

const exported = exportPageData(currentPageData);
const imported = importPageData<Components>(exported, PageDataSchema);
```

## Error Handling Recommendations

- Fail fast on JSON parse errors and surface the original message to the editor UI.
- When validation fails, surface the path + message (e.g., `content.0.props.title: Title is required`).
- Apply `schema` validation when importing external data (uploads/API responses); skip schema for trusted internal round-trips to reduce overhead.

## Notes

- Functions are documentation examples only; production implementations belong in `frontend/widget/src/` per governance.
- Keep schemas aligned with `typescript-interfaces.md` and `zod-schemas.md` to avoid drift between static and runtime validation.
