# Primitive: Popover (Task 1.9)

Reference pattern: Radix Popover (shadcn-style). Add to `frontend/widget/src/components/ui/` when implementing in code.

## Purpose
- Contextual overlay for menus, filters, or inline editors.
- Supports focus trapping and overlay portal registration for Puck (FR-6).

## Props / Behavior
- `open` / `defaultOpen` and `onOpenChange` for controlled/uncontrolled usage.
- `PopoverTrigger` + `PopoverContent` composition; `side`, `align`, `sideOffset`.
- Close on outside click/escape by default; configurable via Radix props.

## ComponentConfig Example

```typescript
interface PopoverProps {
  id: string;
  triggerLabel: string;
  title?: string;
  body?: string;
  align?: 'start' | 'center' | 'end';
}

export const PopoverPrimitive: ComponentConfig<PopoverProps> = {
  label: 'Popover',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    triggerLabel: { type: 'text', label: 'Trigger label' },
    title: { type: 'text', label: 'Title' },
    body: { type: 'textarea', label: 'Body' },
    align: {
      type: 'select',
      label: 'Align',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ],
    },
  },
  defaultProps: {
    id: 'Popover-1',
    triggerLabel: 'Open',
    title: 'Popover title',
    body: 'Popover body copy.',
    align: 'center',
  },
  render: ({ triggerLabel, title, body, align }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-64">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      </PopoverContent>
    </Popover>
  ),
};
```

## Notes
- Register popover portal with Puck overlay if preview interactions need exclusion from drag overlays (per FR-6).
- Keep spacing/width tokens in safelist when using dynamic sizes.
- For rich popover content (forms), consider ScrollArea for long menus.
