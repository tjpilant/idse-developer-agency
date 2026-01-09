# Primitive: Select (Task 1.4)

Reference: shadcn/Radix Select in `frontend/widget/src/components/ui/select.tsx`.

## Purpose
- Accessible select primitive with Radix popover behavior.
- Used in blocks for variant choices (gap/columns/alignment).

## Props / Variants
- Accepts standard select props from the shadcn wrapper: `value`, `onValueChange`, `disabled`, `placeholder`.
- Supports controlled/uncontrolled usage via Radix.

## ComponentConfig Example

```typescript
interface SelectProps {
  id: string;
  label: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  value?: string;
}

export const SelectPrimitive: ComponentConfig<SelectProps> = {
  label: 'Select',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    label: { type: 'text', label: 'Label' },
    placeholder: { type: 'text', label: 'Placeholder' },
    options: {
      type: 'array',
      label: 'Options',
      arrayFields: {
        label: { type: 'text', label: 'Label' },
        value: { type: 'text', label: 'Value' },
      },
    },
    value: { type: 'text', label: 'Default value' },
  },
  defaultProps: {
    id: 'Select-1',
    label: 'Select an option',
    placeholder: 'Choose…',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ],
  },
  render: ({ label, placeholder, options, value }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Select defaultValue={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};
```

## Notes
- Popover portal registration may be needed for Puck overlay; see FR-6 for overlay portal handling.
- Keep common option values in safelist if rendered as classes elsewhere (grid/gap).
- Controlled usage: pass `value`/`onValueChange` when integrating with form libs; Radix `Select` supports both.
