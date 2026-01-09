# Primitive: Checkbox (Task 1.6)

Reference: `frontend/widget/src/components/ui/checkbox.tsx` (Radix Checkbox).

## Purpose
- Boolean toggle with indeterminate support for nested selections.
- Used for flags in blocks (e.g., showBorder, enableShadow).

## Props
- Standard Radix checkbox props: `checked`, `onCheckedChange`, `disabled`, `required`.
- Visual states: checked, unchecked, indeterminate; focus ring matches other primitives.

## ComponentConfig Example

```typescript
interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

export const CheckboxPrimitive: ComponentConfig<CheckboxProps> = {
  label: 'Checkbox',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    label: { type: 'text', label: 'Label' },
    description: { type: 'textarea', label: 'Description' },
    defaultChecked: { type: 'checkbox', label: 'Checked by default' },
  },
  defaultProps: {
    id: 'Checkbox-1',
    label: 'Enable feature',
    defaultChecked: false,
  },
  render: ({ label, description, defaultChecked }) => (
    <div className="flex items-start gap-3">
      <Checkbox defaultChecked={defaultChecked} id="checkbox" />
      <div className="space-y-1">
        <label htmlFor="checkbox" className="text-sm font-medium">{label}</label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  ),
};
```

## Notes
- For indeterminate states, set `checked="indeterminate"` from parent state.
- Keep input sizing consistent with Button/Input focus rings for alignment in forms.
