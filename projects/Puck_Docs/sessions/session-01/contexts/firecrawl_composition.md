# Source: https://puckeditor.com/docs/extending-puck/composition

Extending Puck — Composition

# Composition

Puck uses compositional patterns enable completely custom editor interfaces. See an example at: https://demo.puckeditor.com/custom-ui/edit/.

## Using composition

Composition can be achieved by providing `children` to the `<Puck>` component:

Copy

```
import { Puck } from "@measured/puck";

export function Editor() {
  return (
    <Puck>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gridGap: 16 }}
      >
        <div>
          {/* Render the drag-and-drop preview */}
          <Puck.Preview />
        </div>
        <div>
          {/* Render the component list */}
          <Puck.Components />
        </div>
      </div>
    </Puck>
  );
}
```

## Compositional components

Puck exposes its core components, allowing you to compose them together to create new layouts:

- `<Puck.Components>` - A draggable list of components.
- `<Puck.Fields>` - The fields for the currently selected item.
- `<Puck.Outline>` - An interactive outline.
- `<Puck.Preview>` - A drag-and-drop preview.

