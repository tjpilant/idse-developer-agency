# Primitive: Input (Task 1.2)

Reference implementation: `frontend/widget/src/components/ui/input.tsx`.

## Purpose
- Text entry primitive for single-line inputs (text/email/password/etc.).
- Baseline styling for forms inside blocks (e.g., hero CTA forms, chat widgets).

## Props
- All standard input props (via `React.ComponentProps<"input">`).
- Key styling tokens: `h-9`, `rounded-md`, border/input colors, focus ring.

## ComponentConfig Example

```typescript
interface InputProps {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'password';
  helperText?: string;
}

export const InputPrimitive: ComponentConfig<InputProps> = {
  label: 'Input',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    label: { type: 'text', label: 'Label' },
    placeholder: { type: 'text', label: 'Placeholder' },
    type: {
      type: 'radio',
      label: 'Type',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Password', value: 'password' },
      ],
    },
    helperText: { type: 'text', label: 'Helper text' },
  },
  defaultProps: {
    id: 'Input-1',
    label: 'Label',
    placeholder: 'Enter text',
    type: 'text',
  },
  render: ({ label, placeholder, type, helperText }) => (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Input type={type} placeholder={placeholder} />
      {helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </label>
  ),
};
```

## Usage Example

```tsx
import { Input } from "@/components/ui/input";

export function InputDemo() {
  return (
    <form className="space-y-3">
      <Input type="text" placeholder="Name" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
    </form>
  );
}
```

## Notes
- Uses `cn` to merge custom `className` if provided by blocks.
- Focus-visible ring matches Button; keep tokens in safelist when composing dynamic sizes.
- For password fields in Puck, consider masking toggles at block level (not part of primitive).
