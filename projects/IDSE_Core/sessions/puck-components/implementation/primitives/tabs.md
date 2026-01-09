# Primitive: Tabs (Task 1.7)

Reference pattern: Radix Tabs (shadcn-style). Add to `frontend/widget/src/components/ui/` when implementing in code; SessionTabs in the repo can inform styling.

## Purpose
- Keyboard-accessible tabbed navigation for grouping content.
- Used by TabsBlock and any layout requiring tabbed views.

## Props / Behavior
- `defaultValue` / `value` for uncontrolled/controlled modes.
- `onValueChange` callback.
- `TabsList`, `TabsTrigger`, `TabsContent` composition.
- Keyboard nav: Arrow keys move focus; Enter/Space activates.

## ComponentConfig Example

```typescript
interface TabItem {
  id: string;
  label: string;
  content: string;
}

interface TabsProps {
  id: string;
  defaultTab?: string;
  tabs: TabItem[];
}

export const TabsPrimitive: ComponentConfig<TabsProps> = {
  label: 'Tabs',
  category: 'Primitives',
  fields: {
    id: { type: 'text', label: 'ID' },
    defaultTab: { type: 'text', label: 'Default Tab ID' },
    tabs: {
      type: 'array',
      label: 'Tabs',
      arrayFields: {
        id: { type: 'text', label: 'Tab ID' },
        label: { type: 'text', label: 'Label' },
        content: { type: 'textarea', label: 'Content' },
      },
      defaultItemProps: { id: 'tab-1', label: 'Tab 1', content: 'Tab content' },
    },
  },
  defaultProps: {
    id: 'Tabs-1',
    defaultTab: 'tab-1',
    tabs: [
      { id: 'tab-1', label: 'Tab 1', content: 'First tab content' },
      { id: 'tab-2', label: 'Tab 2', content: 'Second tab content' },
    ],
  },
  render: ({ defaultTab, tabs }) => (
    <Tabs defaultValue={defaultTab ?? tabs[0]?.id}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <p className="text-sm text-muted-foreground">{tab.content}</p>
        </TabsContent>
      ))}
    </Tabs>
  ),
};
```

## Notes
- Ensure focus-visible styles on `TabsTrigger` align with other controls (use `cn`).
- For nested components inside tabs, replace `content` with Slot fields in block-level configs.
- When adding the actual primitive, base it on shadcn/Radix Tabs to satisfy accessibility and keyboard navigation requirements.
