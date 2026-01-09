# Composition: TreeValidator (Task 1.25)

Purpose: Validate and transform PageData trees using Puck’s `walkTree`, ensuring IDs, depth, and allowed components are enforced before render/export.

## API Signature (doc example)
```typescript
import { walkTree } from "@measured/puck";
import { Data } from "./typescript-interfaces";

type ValidationIssue = { path: string; message: string };

export function validateTree<T>(
  data: Data<T>,
  maxDepth = 10,
  allowedComponents?: Record<string, string[]>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  walkTree(data, (node, ctx) => {
    const path = ctx.path.join(".");
    if (!node.props?.id) issues.push({ path, message: "Missing id" });
    if (ctx.depth > maxDepth) issues.push({ path, message: `Depth exceeds ${maxDepth}` });
    if (allowedComponents) {
      const parent = ctx.parent?.component;
      if (parent && allowedComponents[parent] && !allowedComponents[parent].includes(node.component)) {
        issues.push({ path, message: `Component ${node.component} not allowed under ${parent}` });
      }
    }
    return node;
  });

  return { issues };
}
```

## Usage Pattern
- Call before export or render to catch missing IDs, excessive nesting, or disallowed Slot children.
- Supply `allowedComponents` mapping (e.g., GridBlock → [CardBlock, ImageBlock, TextBlock]) to mirror ComponentConfig Slot rules.
- Use `ctx.path` (array of indices/components) to generate precise error messages for editors.

## Transformation Example
```typescript
export function addTimestamps<T>(data: Data<T>) {
  return walkTree(data, (node) => ({
    ...node,
    props: { ...node.props, updatedAt: new Date().toISOString() },
  }));
}
```

## Notes
- Keep validator lightweight; delegate heavy checks (schema validation) to Zod in importer.
- Ensure `walkTree` version matches Puck dependency (current: ^0.19.3). Revalidate on upgrades.
- No production code here; integrate in `frontend/widget/src/` with proper telemetry/logging.
