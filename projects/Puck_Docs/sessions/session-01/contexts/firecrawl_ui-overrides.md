# Source: https://puckeditor.com/docs/extending-puck/ui-overrides

Extending Puck — UI overrides

# UI overrides

The overrides API is highly experimental and allows you to change how Puck renders its default interface.

## Implementing an override

Use the `overrides` prop on `<Puck>` to implement an override, for example customizing drawerItem appearance.

Copy

```
import { Puck } from "@measured/puck";

export function Editor() {
  return (
    <Puck
      // ...
      overrides={{
        // Render a custom element for each item in the component list
        drawerItem: ({ name }) => (
          <div style={{ backgroundColor: "hotpink" }}>{name}</div>
        ),
      }}
    />
  );
}
```

