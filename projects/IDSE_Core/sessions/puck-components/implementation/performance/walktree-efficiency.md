# Task 2.9 — walkTree Efficiency Validation

Purpose: Ensure `walkTree` operations remain performant (<50ms for 100 components).

## Approach
- Build a PageData fixture with ~100 nodes (nested slots).
- Run `walkTree` with a no-op visitor and measure duration.
- Add validations (IDs, depth) and ensure time stays within budget.

## Example snippet
```typescript
import { walkTree } from "@measured/puck";

const t0 = performance.now();
walkTree(fixture, (node) => node);
const duration = performance.now() - t0;
console.log(`walkTree duration: ${duration.toFixed(2)}ms`);
```

## Notes
- If duration exceeds budget, inspect visitor work; keep validation lightweight.
- Avoid heavy computations in visitors; offload to schema validation where possible.
