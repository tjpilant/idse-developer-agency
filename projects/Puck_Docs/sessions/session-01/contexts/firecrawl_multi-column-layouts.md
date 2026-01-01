# Source: https://puckeditor.com/docs/integrating-puck/multi-column-layouts

Integrating Puck — Multi-column Layouts

# Multi-column Layouts

Puck supports nested and multi-column layouts across any CSS layout using the `slot` field.

Slots replace the `<DropZone>` component component, which will soon be deprecated and removed. For migration notes, see these docs: https://puckeditor.com/docs/guides/migrations/dropzones-to-slots

## Nested components

Add the `slot` field to your component to create a zone that you can drop components into.

Copy

```
const config = {
  components: {
    Example: {
      fields: {
        content: {
          type: "slot",
        },
      },
      render: ({ content: Content }) => {
        return <Content />;
      },
    },
    Card: {
      render: () => <div>Hello, world</div>,
    },
  },
};
```

