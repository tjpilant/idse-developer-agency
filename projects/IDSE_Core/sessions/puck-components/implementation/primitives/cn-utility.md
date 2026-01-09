# Utility: cn() Pattern (Task 1.11)

Reference usage: `frontend/widget/src/lib/utils.ts` (cn from `clsx` + `tailwind-merge`).

## Purpose
- Normalize className merging across primitives/blocks, preventing duplicate or conflicting Tailwind classes.
- Required for composable variants (buttons, cards, tabs) and dynamic class tokens (grid/gap).

## Implementation Reference

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Usage Notes
- Always use `cn` when combining variant classes with consumer-provided `className`.
- Safelist dynamic Tailwind tokens referenced through `cn` (e.g., `grid-cols-${n}`, `gap-${size}`) to keep purge deterministic.
- Keep `twMerge` up to date with Tailwind version; revisit when migrating to Tailwind v4.

## Example

```tsx
const buttonClasses = cva("inline-flex items-center", {
  variants: { size: { sm: "h-8 px-3", lg: "h-10 px-6" } },
});

export function Example({ size = "sm", className }: { size?: "sm" | "lg"; className?: string }) {
  return <button className={cn(buttonClasses({ size }), className)}>Click</button>;
}
```
