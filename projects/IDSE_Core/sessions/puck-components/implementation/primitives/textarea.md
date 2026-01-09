# Primitive: Textarea (Task 1.5)

Reference: `frontend/widget/src/components/ui/textarea.tsx`.

## Purpose
- Multi-line text input with consistent styling and focus states.
- Used for descriptions, body copy, and multiline fields in blocks.

## Props
- Standard textarea props via `React.TextareaHTMLAttributes<HTMLTextAreaElement>`.
- Key styling tokens: `min-h`, `rounded-md`, focus ring, disabled opacity.

## ComponentConfig Example

```typescript
interface TextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
  helperText?: string;
}

export const TextareaPrimitive: ComponentConfig<TextareaProps> = {
  label: 'Textarea',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    label: { type: 'text', label: 'Label' },
    placeholder: { type: 'text', label: 'Placeholder' },
    rows: { type: 'number', label: 'Rows', min: 2, max: 12, step: 1 },
    helperText: { type: 'text', label: 'Helper text' },
  },
  defaultProps: {
    id: 'Textarea-1',
    label: 'Message',
    placeholder: 'Enter text',
    rows: 4,
  },
  render: ({ label, placeholder, rows = 4, helperText }) => (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Textarea placeholder={placeholder} rows={rows} />
      {helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </label>
  ),
};
```

## Notes
- Keep height tokens (`rows`) bounded to avoid layout jumps in preview.
- If char-count or auto-resize is desired, implement at block level to avoid coupling the primitive.
