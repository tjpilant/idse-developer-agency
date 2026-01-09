# Block: TabsBlock (Task 1.20)

Purpose: Tabbed layout built on Tabs primitive with Slot for per-tab content.

## Props (example)
```typescript
interface TabsBlockProps {
  id: string;
  defaultTab?: string;
  tabs: {
    id: string;
    label: string;
    content: any[]; // Slot field for nested components
  }[];
}
```

## ComponentConfig
```typescript
export const TabsBlock: ComponentConfig<TabsBlockProps> = {
  label: 'Tabs',
  category: 'Layout',
  fields: {
    id: { type: 'text', label: 'ID' },
    defaultTab: { type: 'text', label: 'Default tab ID' },
    tabs: {
      type: 'array',
      label: 'Tabs',
      arrayFields: {
        id: { type: 'text', label: 'Tab ID' },
        label: { type: 'text', label: 'Label' },
        content: {
          type: 'slot',
          label: 'Tab Content',
          allowedComponents: ['TextBlock', 'ImageBlock', 'CardBlock', 'ButtonGroupBlock', 'ContainerBlock'],
        },
      },
      defaultItemProps: { id: 'tab-1', label: 'Tab 1', content: [] },
    },
  },
  defaultProps: {
    id: 'TabsBlock-1',
    defaultTab: 'tab-1',
    tabs: [
      { id: 'tab-1', label: 'Tab 1', content: [] },
      { id: 'tab-2', label: 'Tab 2', content: [] },
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
          {/* Puck renders slot content here */}
        </TabsContent>
      ))}
    </Tabs>
  ),
};
```

## Notes
- Slot-driven tab content allows nested blocks; ensure Slot validation enforces IDs on nested components.
- Safelist needed for any alignment/spacing classes if customized.
