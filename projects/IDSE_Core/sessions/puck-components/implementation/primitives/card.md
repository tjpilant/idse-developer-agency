# Primitive: Card (Task 1.3)

Reference implementation: `frontend/widget/src/components/ui/card.tsx`.

## Purpose
- Container primitive with header/content/footer slots for grouping content.
- Used by CardBlock, GridBlock items, and layout compositions.

## Structure / Props
- `Card`: wrapper with border, background, shadow.
- `CardHeader`: flex column with spacing/padding.
- `CardContent`: body region.
- `CardFooter`: actions/footer region.
- `CardTitle` / `CardDescription`: typography helpers.
- Accepts standard `div` attributes + `className` for overrides.

## ComponentConfig Example (Card as Block Wrapper)

```typescript
interface CardPrimitiveProps {
  id: string;
  title: string;
  description?: string;
  showFooter: boolean;
}

export const CardPrimitive: ComponentConfig<CardPrimitiveProps> = {
  label: 'Card',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    showFooter: { type: 'checkbox', label: 'Show footer actions' },
  },
  defaultProps: {
    id: 'Card-1',
    title: 'Card title',
    description: 'Card description',
    showFooter: true,
  },
  render: ({ title, description, showFooter }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card body content</p>
      </CardContent>
      {showFooter && (
        <CardFooter>
          <Button size="sm" variant="secondary">Action</Button>
        </CardFooter>
      )}
    </Card>
  ),
};
```

## Usage Example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CardDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Track conversion and engagement.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Charts or summary text live here.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">View report</Button>
      </CardFooter>
    </Card>
  );
}
```

## Notes
- Card uses CSS variables for background/text tokens; respects theme from Tailwind config.
- Keep padding/gap tokens in safelist if dynamically varied in blocks.
- Use `Card` + `Slot` to host nested blocks when composing CardBlock; Slot configuration lives at block level.
