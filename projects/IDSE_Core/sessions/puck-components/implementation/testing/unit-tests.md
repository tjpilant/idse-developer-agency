# Task 2.1 — Unit Test Examples (Jest/Vitest + Testing Library)

Purpose: Provide patterns to test Puck components and configurations without requiring the full editor runtime.

## Patterns
- **Render functions**: Invoke `ComponentConfig.render(props)` directly and assert DOM output (e.g., CardBlock title/description, image alt).
- **Schema validation**: Pair render tests with Zod schema parsing to ensure props match expected shapes.
- **Slot fixtures**: For Slot-based blocks (GridBlock), pass nested items and assert they are rendered.

## Example: CardBlock render test (Vitest)
```typescript
import { render, screen } from "@testing-library/react";
import { Card, type CardProps } from "@/puck/components/Card";

const renderCard = (props?: Partial<CardProps>) => {
  const merged: CardProps = {
    title: "Card One",
    description: "Body",
    icon: "✅",
    ...props,
  };
  return render(<>{Card.render(merged)}</>);
};

it("renders title and description", () => {
  renderCard();
  expect(screen.getByText("Card One")).toBeInTheDocument();
  expect(screen.getByText("Body")).toBeInTheDocument();
});
```

## Example: Grid + Card Slot test (Vitest)
```typescript
import { render, screen } from "@testing-library/react";
import { GridBlock } from "@/puck/components/Grid"; // when implemented
import { Card } from "@/puck/components/Card";

const gridProps = {
  id: "grid_1",
  columns: 2,
  gap: "md" as const,
  items: [
    { component: "CardBlock", props: { id: "card_1", title: "One", description: "A", icon: "✅" } },
    { component: "CardBlock", props: { id: "card_2", title: "Two", description: "B", icon: "⭐" } },
  ],
};

it("renders Slot items", () => {
  const items = gridProps.items.map((item) => Card.render(item.props));
  render(<>{GridBlock.render({ ...gridProps, items })}</>);
  expect(screen.getByText("One")).toBeInTheDocument();
  expect(screen.getByText("Two")).toBeInTheDocument();
});
```

## Notes
- Keep tests in `frontend/widget/src/puck/components/__tests__/` (already using Vitest).
- Use `jsdom` (configured) for DOM assertions.
- For future Puck-specific hooks, mock overlay/slot behavior as needed; avoid coupling to editor internals in unit tests.
