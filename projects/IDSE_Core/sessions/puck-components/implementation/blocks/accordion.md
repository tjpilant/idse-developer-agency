# Block: AccordionBlock (Task 1.19)

Purpose: Expandable panels using Radix Accordion patterns; supports Slot for panel content if needed.

## Props (example)
```typescript
interface AccordionProps {
  id: string;
  type: 'single' | 'multiple';
  collapsible: boolean;
  items: {
    id: string;
    title: string;
    content: any[]; // Slot
  }[];
}
```

## ComponentConfig
```typescript
export const AccordionBlock: ComponentConfig<AccordionProps> = {
  label: 'Accordion',
  category: 'Content',
  fields: {
    id: { type: 'text', label: 'ID' },
    type: {
      type: 'radio',
      label: 'Type',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
      ],
    },
    collapsible: { type: 'checkbox', label: 'Allow closing all items' },
    items: {
      type: 'array',
      label: 'Items',
      arrayFields: {
        id: { type: 'text', label: 'Item ID' },
        title: { type: 'text', label: 'Title' },
        content: {
          type: 'slot',
          label: 'Content',
          allowedComponents: ['TextBlock', 'ButtonGroupBlock', 'ImageBlock', 'CardBlock'],
        },
      },
      defaultItemProps: { id: 'item-1', title: 'Item 1', content: [] },
    },
  },
  defaultProps: {
    id: 'Accordion-1',
    type: 'single',
    collapsible: true,
    items: [
      { id: 'item-1', title: 'Question 1', content: [] },
      { id: 'item-2', title: 'Question 2', content: [] },
    ],
  },
  render: ({ type, collapsible, items }) => (
    <Accordion type={type} collapsible={collapsible} className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            {/* Puck renders slot content here */}
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
```

## Notes
- For Slot-based content, replace `content` field with Slot and render nested components inside `AccordionContent`.
- Ensure focus/keyboard interactions match Radix defaults; use `cn` to merge custom styles if added.
- Safelist impact: no dynamic utility classes beyond defaults; if adding per-item spacing (`space-y-*`) or padding, include those tokens in the safelist.
