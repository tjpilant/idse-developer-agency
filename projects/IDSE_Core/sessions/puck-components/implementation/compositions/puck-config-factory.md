# Composition: PuckConfigFactory (Task 1.24)

Purpose: Build a type-safe Puck `Config<Components>` object from documented ComponentConfig definitions (primitives/blocks), ensuring consistent categories and metadata.

## API Signature (doc example)
```typescript
import { Config, ComponentConfig } from "@measured/puck";

type Components = {
  HeroBlock: ComponentConfig<HeroProps>;
  CardBlock: ComponentConfig<CardBlockProps>;
  GridBlock: ComponentConfig<GridProps>;
  TextBlock: ComponentConfig<TextProps>;
  ImageBlock: ComponentConfig<ImageProps>;
  ContainerBlock: ComponentConfig<ContainerProps>;
  ButtonGroupBlock: ComponentConfig<ButtonGroupProps>;
  AccordionBlock: ComponentConfig<AccordionProps>;
  TabsBlock: ComponentConfig<TabsBlockProps>;
  ChatWidgetBlock: ComponentConfig<ChatWidgetProps>;
};

export function createPuckConfig(components: Components): Config<Components> {
  return {
    components,
    categories: {
      Content: { components: ["HeroBlock", "CardBlock", "TextBlock"], title: "Content Blocks" },
      Media: { components: ["ImageBlock"], title: "Media" },
      Layout: { components: ["GridBlock", "ContainerBlock", "ButtonGroupBlock", "TabsBlock", "AccordionBlock"], title: "Layout" },
      Widgets: { components: ["ChatWidgetBlock"], title: "Widgets" },
    },
    root: {
      fields: {
        title: { type: "text", label: "Page Title" },
        description: { type: "textarea", label: "Page Description" },
      },
    },
  };
}
```

## Usage Pattern
- Import documented `ComponentConfig` objects from the blocks/primitives modules.
- Keep categories aligned with editor palette UX; update when adding/removing blocks.
- Root fields optional; add metadata fields here if editors need page-level settings.

## Notes
- Ensure component keys match the `component` strings used in PageData fixtures and Slot `allowedComponents`.
- Validate config (types) via `Config<Components>` to catch missing components at compile time.
- For production, consider a factory that accepts overrides (theme, slots, feature flags) to enable per-tenant customization.
