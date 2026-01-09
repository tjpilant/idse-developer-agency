# Task 2.4 — Integration Test Examples

Purpose: Cover multi-component flows: Slot nesting, inline editing placeholders, and overlay portal behavior.

## Patterns
- Render a composed tree (Hero + Grid + Card) with Puck-like props and assert DOM plus event handling.
- Mock overlay portals for Radix components (popover/tooltip) if present in the test subject.
- Use `importPageData` + `exportPageData` round-trip to assert data integrity and render output together.

## Example: Slot nesting render
```typescript
import { render, screen } from "@testing-library/react";
import { GridBlock } from "@/puck/components/Grid";
import { Card } from "@/puck/components/Card";

const items = [
  Card.render({ id: "card_1", title: "One", description: "Body", icon: "✅" }),
  Card.render({ id: "card_2", title: "Two", description: "Body", icon: "⭐" }),
];

it("renders nested cards in grid", () => {
  render(<>{GridBlock.render({ id: "grid_1", columns: 2, gap: "md", items })}</>);
  expect(screen.getByText("One")).toBeInTheDocument();
  expect(screen.getByText("Two")).toBeInTheDocument();
});
```

## Example: PageData round-trip integration
```typescript
import { importPageData, exportPageData } from "../pagedata-api";
import { PageDataSchema } from "./PageDataSchema";

const fixture = { /* PageData fixture with Grid + Cards */ };

it("round-trips PageData and validates schema", () => {
  const imported = importPageData(JSON.stringify(fixture), PageDataSchema);
  expect(imported.errors).toBeUndefined();

  const json = exportPageData(imported.data, false);
  const parsed = importPageData(json, PageDataSchema);
  expect(parsed.errors).toBeUndefined();
});
```

## Notes
- Keep integration tests focused on documented behaviors (Slot rendering, schema validation). Avoid coupling to full Puck runtime.
- For overlay components, use `document.body.appendChild` mocks or portal stubs if needed; otherwise skip overlay assertions.
