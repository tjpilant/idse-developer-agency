# Source: https://puckeditor.com/docs/integrating-puck/overlay-portals

Integrating Puck — Overlay Portals

# Overlay Portals

Overlay Portals enable you to disable the Puck overlay when hovering over specific elements, making them interactive in the editor.

Use the `registerOverlayPortal` API to mark an element as a portal.

Copy

```
import { registerOverlayPortal } from "@measured/puck";

const Example = () => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => registerOverlayPortal(ref.current), [ref.current]);

  return (
    <button ref={ref} onClick={() => alert("Click")}>
      Clickable
    </button>
  );
};
```

