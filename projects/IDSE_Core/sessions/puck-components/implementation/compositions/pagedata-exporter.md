# Composition: PageDataExporter (Task 1.23)

Purpose: Serialize in-memory PageData to JSON for download or API persistence, pairing with `importPageData`.

## API Signature (doc example)
```typescript
import { Data } from "./typescript-interfaces";

export function exportPageData<T>(
  data: Data<T>,
  prettyPrint: boolean = true
): string {
  return JSON.stringify(data, null, prettyPrint ? 2 : 0);
}
```

## Usage Pattern
- Provide `prettyPrint=true` for human-friendly downloads; use `false` for network payloads if size-sensitive.
- Combine with validation (optional) before exporting to ensure IDs/props are present.
- Attach metadata (timestamp, version) at call site if needed; keep core exporter focused on serialization.

## Example (download helper)
```typescript
const json = exportPageData(pageData, true);
const blob = new Blob([json], { type: "application/json" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "page-data.json";
link.click();
```

## Notes
- Keep the exporter side-effect free; IO (downloads/uploads) stays in the app layer.
- Align data shape with `typescript-interfaces.md` and Zod schemas to avoid drift.
- For API posts, send JSON string or parsed object per backend expectation; include ETag/version if supported.
