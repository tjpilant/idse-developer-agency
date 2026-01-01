# Source: https://puckeditor.com/docs/extending-puck/plugins

Extending Puck — Plugin API

# Plugin API

The plugin API is highly experimental and is likely to experience breaking changes.

The plugin API enables developers to share extensions to Puck and are generally built on top of existing APIs.

## Official plugins

Puck provides official plugins for common use-cases, e.g. emotion-cache and heading-analyzer.

## Loading a plugin

Provide plugins to the `plugins` prop on `<Puck>`:

Copy

```
import { Puck } from "@measured/puck";
import myPlugin from "my-puck-plugin";

export function Editor() {
  return (
    <Puck
      // ...
      plugins={[myPlugin]}
    />
  );
}
```

