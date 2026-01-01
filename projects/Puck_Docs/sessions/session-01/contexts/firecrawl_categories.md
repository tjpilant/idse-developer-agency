# Source: https://puckeditor.com/docs/integrating-puck/categories

Integrating Puck — Categories

# Categories

Categories allow you to group components in the left side bar.

## Creating categories

Use the `categories` API to define the component categories.

Copy

```
const config = {
  categories: {
    typography: {
      components: ["HeadingBlock", "ParagraphBlock"],
    },
  },
  // ...
};
```

