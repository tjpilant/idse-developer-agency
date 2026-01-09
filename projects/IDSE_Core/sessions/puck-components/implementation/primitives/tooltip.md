# Primitive: Tooltip (Task 1.8)

Reference: `frontend/widget/src/components/ui/tooltip.tsx` (Radix Tooltip).

## Purpose
- Hover/focus helper for describing icons or controls.
- Used in blocks to provide inline hints without extra layout.

## Props
- Standard Radix tooltip props via `Tooltip`, `TooltipTrigger`, `TooltipContent`.
- `sideOffset` default 4; supports `side` positioning and motion classes.

## ComponentConfig Example (as helper, not standalone)

Tooltip is generally composed with another element rather than configured as a standalone Puck component. Example wrapping a Button in a block:

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" aria-label="More info">?</Button>
    </TooltipTrigger>
    <TooltipContent side="top">Additional details here.</TooltipContent>
  </Tooltip>
 </TooltipProvider>
```

## Notes
- Ensure tooltip portal respects Puck overlay (FR-6); if needed, register overlay portal or exclude tooltip content from overlays.
- Keep animation classes in safelist if customizing.
