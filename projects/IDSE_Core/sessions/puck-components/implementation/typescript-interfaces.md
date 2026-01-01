# Task 0.1 — TypeScript PageData Interfaces

Purpose: document the typed shape of Puck PageData so schemas, import/export helpers, and validation stay consistent across primitives, blocks, and compositions.

## Interfaces

```typescript
/**
 * Root PageData structure used by Puck (FR-8)
 */
export interface Data<Components = any> {
  /** Page-level content nodes */
  content: ComponentData<Components>[];
  /** Root metadata (title, seo, layout flags) */
  root: RootData;
  /** Optional: legacy zones (prefer Slot fields instead) */
  zones?: Record<string, ComponentData<Components>[]>;
}

/**
 * Typed component instance (maps to Config.components keys)
 */
export interface ComponentData<Components = any> {
  /** Component type key registered in Config<Components> */
  type: keyof Components;
  /** Props captured from Puck fields; must include unique id */
  props: {
    id: string;
    [key: string]: unknown;
  };
  /** Optional metadata for inspector UX */
  meta?: ComponentMeta;
}

/**
 * Root-level page configuration
 */
export interface RootData {
  /** Optional page title/description used by preview shell */
  props?: Record<string, unknown>;
  /** Optional friendly name for editors */
  title?: string;
}

export interface ComponentMeta {
  label?: string;
  category?: string;
  icon?: string;
  description?: string;
}
```

## Example PageData JSON (with Slot nesting)

```json
{
  "content": [
    {
      "type": "HeroBlock",
      "props": {
        "id": "HeroBlock-1234",
        "title": "Welcome to Our Platform",
        "subtitle": "Build faster with block-first components",
        "ctaText": "Get Started",
        "ctaUrl": "/signup",
        "backgroundImage": "https://example.com/hero-bg.jpg",
        "align": "center"
      }
    },
    {
      "type": "GridBlock",
      "props": {
        "id": "GridBlock-5678",
        "columns": 3,
        "gap": "lg",
        "items": [
          {
            "type": "CardBlock",
            "props": {
              "id": "CardBlock-a1",
              "title": "Fast",
              "description": "Lightning-fast load times"
            }
          },
          {
            "type": "CardBlock",
            "props": {
              "id": "CardBlock-a2",
              "title": "Accessible",
              "description": "WCAG 2.1 AA compliant"
            }
          }
        ]
      }
    }
  ],
  "root": {
    "props": {
      "title": "Homepage",
      "description": "Welcome to our component library"
    }
  }
}
```

## Validation Notes

- Interfaces align with Puck 0.19.3 (current `frontend/widget` dependency) and remain forward-compatible with Slot/inline features planned for 0.20.x.
- Run `tsc --noEmit` against interface examples to ensure types stay sound when components expand.
- ComponentData `props.id` is required for walkTree validation and import/export stability; enforce presence in schemas and tests.

## References

- Plan Section 3: Data Model (ComponentData, RootData)
- Tasks.md Task 0.1 (acceptance: JSDoc + example JSON + `tsc --noEmit` passes)
