# Source: https://puckeditor.com/docs/integrating-puck/dynamic-props

Integrating Puck — Dynamic Props

# Dynamic Props

Dynamic prop resolution allows you to change the props for a component after the props have been changed by the user. This is useful for making third-party API calls, such as requesting the latest content from a headless CMS.

## Dynamic component props

The `resolveData` function allows you to make changes to the props and set fields as read-only.

Copy

```
const config = {
  components: {
    HeadingBlock: {
      fields: {
        title: {
          type: "text",
        },
        resolvedTitle: {
          type: "text",
        },
      },
      resolveData: async ({ props }) => {
        return {
          props: {
            resolvedTitle: props.title,
          },
        };
      },
      render: ({ resolvedTitle }) => {
        return <h1>{resolvedTitle}</h1>;
      },
    },
  },
};
```

