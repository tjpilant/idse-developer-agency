# Implementation Plan

Source spec: /home/tjpilant/projects/idse-developer-agency/projects/IDSE_Core/sessions/puck-components/specs/spec.md

This plan translates the puck-components specification into a concrete implementation approach. All sections align with the IDSE constitution and the documentation-only constraint (Article X).

---

## 1. Architecture Summary

### Overview

The Puck Components library follows a **three-tier block-first architecture** designed for composition and reusability within the Puck visual editor. Components are built on Radix UI unstyled primitives, styled with shadcn/ui patterns, and integrated with Puck's Slot API for hierarchical nesting.

### Three-Tier Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Puck Editor Layer                        │
│  (<Puck> component with puckConfig, PageData state)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Tier 3: Page Compositions                       │
│  (PageBuilder, PageDataImporter/Exporter, PuckConfigFactory) │
│  - Wraps Puck editor for IDSE Admin integration             │
│  - Provides import/export utilities for persistence          │
│  - Type-safe config generation helpers                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           Tier 2: Styled Block Components                    │
│  (HeroBlock, CardBlock, GridBlock, TextBlock, etc.)          │
│  - Implements ComponentConfig<Props>                         │
│  - Uses Slot field API for nesting (FR-4)                    │
│  - Supports inline editing where applicable (FR-5)           │
│  - Registers overlay portals for interactive elements (FR-6) │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│        Tier 1: Primitive Components (Radix + shadcn)         │
│  (Button, Input, Card, Select, Textarea, Checkbox, etc.)     │
│  - Radix UI primitives wrapped with shadcn patterns          │
│  - cn() utility for className composition (FR-11)            │
│  - CSS variables for theming (FR-10)                         │
│  - No Puck-specific logic (pure UI components)               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Decision 1: Radix + shadcn over Custom Components**
- **Rationale**: Leverages battle-tested accessibility (WCAG 2.1 AA) and existing repo patterns at `/frontend/widget/src/components/ui/`
- **Context Reference**: [Intent - Radix APIs](../intents/intent.md#L15), [spec.md FR-2](../specs/spec.md#L229-232)
- **Tradeoff**: Slightly heavier bundle size (~50KB for Radix primitives) vs accessibility guarantees, keyboard nav, and proven DX
- **Decision**: Accept bundle size cost for accessibility and consistency benefits

**Decision 2: Slot API for Nesting (Puck 0.19+)**
- **Rationale**: Replaces deprecated DropZones with modern Slot field API, improves performance for large pages
- **Context Reference**: [Context - Puck 0.19](../contexts/context.md#L67-69), [spec.md FR-4](../specs/spec.md#L243-246)
- **Tradeoff**: Requires Puck 0.19+ (breaks compatibility with 0.18 and earlier) but enables better data structure and walkTree utilities
- **Decision**: Target Puck 0.19+ only (document migration path from DropZones if needed)

**Decision 3: Documentation-Only Artifacts**
- **Rationale**: IDSE agency produces specs/plans/examples; IDE team writes production code (separation of concerns)
- **Context Reference**: [IDSE Article X](../../docs/02-idse-constitution.md), [spec.md constraint](../specs/spec.md#L462)
- **Tradeoff**: Requires handoff process and clear documentation vs direct code delivery
- **Decision**: All artifacts in `/implementation/` are markdown docs with code examples, not executable files

**Decision 4: TypeScript-First with Strict Mode**
- **Rationale**: Catches configuration errors at compile time, enables autocomplete for Puck configs
- **Context Reference**: [Context - Technical Environment](../contexts/context.md#L44), [spec.md FR-12](../specs/spec.md#L291-294), [spec.md NFR-5](../specs/spec.md#L354-357)
- **Tradeoff**: Requires more upfront type definitions but dramatically reduces runtime errors and improves DX
- **Decision**: All examples use TypeScript strict mode, document type inference patterns

### Component Interaction Flow

```
1. Developer defines component
   ↓ Creates ComponentConfig<Props> with fields, defaultProps, render

2. Component registered in puckConfig
   ↓ Added to Config<Components> object with category metadata

3. User drags component in Puck editor
   ↓ Puck creates PageData entry: { type: "ComponentName", props: { id: "...", ...fields } }

4. User edits fields in sidebar
   ↓ Puck updates PageData props, triggers re-render of preview

5. User nests components (if Slot field present)
   ↓ Child component added to parent's Slot field array

6. Page published
   ↓ PageData serialized to JSON via exportPageData() helper

7. Page rendered (public-facing or preview)
   ↓ <Render data={pageData} config={puckConfig} /> displays final page
```

### Existing Codebase Integration Points

- **Tier 1 Primitives**: Extend existing shadcn components at `/frontend/widget/src/components/ui/` (Button, Input, Card, Select already implemented)
- **Tier 2 Blocks**: Reference existing Puck components at `/frontend/widget/src/puck/components/` (Hero, Card, ChatWidget, FourColumnLayout serve as implementation patterns)
- **Styling**: Follow Tailwind patterns from existing codebase (cn() utility, CSS variable theming)

---

## 2. Components

### Tier 1: Primitive Components (Radix + shadcn patterns)

| Component | Responsibility | Interfaces / Dependencies | Context Reference |
|-----------|----------------|---------------------------|-------------------|
| **Button** | Accessible button with variants (primary, secondary, outline, ghost), sizes (sm, md, lg), disabled/loading states | Radix Button primitive + cn() utility, variant props | Existing: `/frontend/widget/src/components/ui/button.tsx`, [spec.md FR-2](../specs/spec.md#L229-232) |
| **Input** | Text input with label, validation state, helper text, error messaging | Radix Input primitive, label association for a11y | Existing: `/frontend/widget/src/components/ui/input.tsx` |
| **Card** | Container with header, content, footer sections for composable layouts | Radix Card primitives (Root, Header, Content, Footer) | Existing: `/frontend/widget/src/components/ui/card.tsx`, [Context - shadcn Card](../contexts/context.md#L101) |
| **Select** | Dropdown selection with keyboard navigation, searchable options, overlay portal for Puck integration | Radix Select primitive + Portal, registerOverlayPortal for Puck (FR-6) | Existing: `/frontend/widget/src/components/ui/select.tsx`, [spec.md FR-6](../specs/spec.md#L253-256) |
| **Textarea** | Multi-line text input with auto-resize behavior, character count option | Radix Textarea primitive, resize utilities | [Context - shadcn Textarea](../contexts/context.md#L104) |
| **Checkbox** | Accessible checkbox with label, indeterminate state support | Radix Checkbox primitive, label for a11y | [Context - shadcn Checkbox](../contexts/context.md#L106) |
| **Tabs** | Tabbed interface for content organization with keyboard navigation (Arrow keys) | Radix Tabs primitives (Root, List, Trigger, Content) | [Context - shadcn Tabs](../contexts/context.md#L107) |
| **Tooltip** | Contextual hint on hover/focus with positioning options (top, bottom, left, right) | Radix Tooltip primitive + Portal, delay props | [Context - shadcn Tooltip](../contexts/context.md#L110) |
| **Popover** | Floating content overlay for complex interactions (menus, pickers), overlay portal for Puck | Radix Popover primitive + Portal, registerOverlayPortal for Puck (FR-6) | [Context - shadcn Popover](../contexts/context.md#L109), [spec.md FR-6](../specs/spec.md#L253-256) |
| **Separator** | Visual divider between sections (horizontal/vertical orientation) | Radix Separator primitive, orientation prop | Existing: `/frontend/widget/src/components/ui/separator.tsx` |

**Implementation Note**: All primitives follow existing patterns in `/frontend/widget/src/components/ui/` per [spec.md FR-2](../specs/spec.md#L229-232) and [FR-11](../specs/spec.md#L282-285).

---

### Tier 2: Styled Block Components (Puck-compatible)

| Component | Responsibility | Interfaces / Dependencies | Context Reference |
|-----------|----------------|---------------------------|-------------------|
| **HeroBlock** | Page hero section with headline, subtext, CTA buttons, optional background image. Supports inline editing for title/subtitle | ComponentConfig<HeroProps>, uses Button primitive, inline field for text (FR-5) | Existing: `/frontend/widget/src/puck/components/Hero.tsx`, [spec.md FR-5](../specs/spec.md#L248-251) |
| **CardBlock** | Feature card with icon, title, description for callouts or feature grids | ComponentConfig<CardProps>, uses Card primitive | Existing: `/frontend/widget/src/puck/components/Card.tsx` |
| **GridBlock** | Responsive grid layout with Slot field for child components, configurable columns (1-4), gap sizes | ComponentConfig<GridProps>, Slot field API (FR-4), responsive Tailwind classes | [spec.md FR-4](../specs/spec.md#L243-246), [Context - Puck 0.19](../contexts/context.md#L67-69) |
| **TextBlock** | Rich text content block with inline WYSIWYG editing (headings, paragraphs, lists) | ComponentConfig<TextProps>, inline field for contentEditable (FR-5) | [spec.md FR-5](../specs/spec.md#L248-251), [Context - Puck 0.20](../contexts/context.md#L63-65) |
| **ImageBlock** | Image display with caption, alt text, responsive sizing, external field for image URL picker | ComponentConfig<ImageProps>, external field for image selection | [Context - Puck external data sources](../contexts/context.md#L91) |
| **ContainerBlock** | Generic container with Slot for nested components, configurable padding/margin/background | ComponentConfig<ContainerProps>, Slot field with defaultProps (FR-4) | [spec.md FR-4](../specs/spec.md#L243-246), existing FourColumnLayout pattern |
| **ButtonGroupBlock** | Horizontal/vertical button group with multiple CTA options, array field for buttons | ComponentConfig<ButtonGroupProps>, uses Button primitive array, layout options | [spec.md FR-1](../specs/spec.md#L224-227) |
| **AccordionBlock** | Collapsible Q&A sections with array field for accordion items | ComponentConfig<AccordionProps>, uses Radix Collapsible | Existing: `/frontend/widget/src/components/ui/collapsible.tsx` |
| **TabsBlock** | Tabbed content sections with Slots for tab panels (each tab has nested components) | ComponentConfig<TabsProps>, uses Tabs primitive + Slot fields (FR-4) | [Context - shadcn Tabs](../contexts/context.md#L107), [spec.md FR-4](../specs/spec.md#L243-246) |
| **ChatWidgetBlock** | Embedded chat interface (existing implementation) for live support or agent interactions | ComponentConfig<ChatProps>, WebSocket integration | Existing: `/frontend/widget/src/puck/components/ChatWidget.tsx` |

**Implementation Note**: All blocks implement ComponentConfig per [spec.md FR-1](../specs/spec.md#L224-227). Each has `fields`, `defaultProps`, `render` function, and optional `resolveData` for async operations.

---

### Tier 3: Page-Level Compositions

| Component | Responsibility | Interfaces / Dependencies | Context Reference |
|-----------|----------------|---------------------------|-------------------|
| **PageBuilder** | Top-level Puck editor wrapper with config, initial data, onPublish callback for IDSE Admin integration | <Puck> component wrapper, puckConfig provider, state management | [Context - Puck component configuration](../contexts/context.md#L86) |
| **PageDataImporter** | Utility to load PageData from JSON (file upload or API response), validates schema | Accepts JSON string, validates against schema, returns Data<Components> (FR-8) | [spec.md FR-8](../specs/spec.md#L263-266), [spec.md US-8](../specs/spec.md#L211-216) |
| **PageDataExporter** | Utility to serialize PageData to JSON for persistence (download or API POST) | Accepts Data<Components>, returns formatted JSON string (FR-8) | [spec.md FR-8](../specs/spec.md#L263-266), [spec.md US-8](../specs/spec.md#L211-216) |
| **PuckConfigFactory** | Helper to create type-safe Config<Components> from component registry, auto-generates categories | Type utilities for Config generation (FR-12) | [spec.md FR-12](../specs/spec.md#L291-294) |
| **TreeValidator** | Uses walkTree to validate nested component structures (detect circular refs, depth limits, required fields) | walkTree utility (FR-7), validation rules | [spec.md FR-7](../specs/spec.md#L258-261), [Context - Puck 0.19](../contexts/context.md#L67-69) |

**Implementation Note**: These are **documentation/examples**, not production utilities per [spec.md constraint](../specs/spec.md#L462). They demonstrate patterns the IDE team can implement.

---

## 3. Data Model

### Puck PageData Schema

**TypeScript Interface** ([spec.md FR-8](../specs/spec.md#L263-266)):

```typescript
/**
 * Puck PageData structure (Context: Puck component configuration docs)
 * Reference: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_component-configuration.md
 */
interface Data<Components = any> {
  /** Array of component instances on the page */
  content: ComponentData<Components>[];

  /** Root-level page configuration (title, metadata) */
  root: RootData;

  /** Optional zones for multi-region layouts (DEPRECATED: use Slots instead) */
  zones?: Record<string, ComponentData<Components>[]>;
}

interface ComponentData<Components = any> {
  /** Component type (must match key in Config.components) */
  type: keyof Components;

  /** Component instance props */
  props: {
    /** Unique identifier for this instance */
    id: string;

    /** User-configured field values */
    [key: string]: any;
  };
}

interface RootData {
  /** Root-level props (page title, metadata, etc.) */
  props?: Record<string, any>;

  /** Optional root title override */
  title?: string;
}
```

**Example PageData JSON**:

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
              "description": "Lightning-fast load times with optimized rendering",
              "icon": "⚡"
            }
          },
          {
            "type": "CardBlock",
            "props": {
              "id": "CardBlock-a2",
              "title": "Accessible",
              "description": "WCAG 2.1 AA compliant out of the box",
              "icon": "♿"
            }
          },
          {
            "type": "CardBlock",
            "props": {
              "id": "CardBlock-a3",
              "title": "Type-Safe",
              "description": "Full TypeScript support with strict mode",
              "icon": "🛡️"
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

---

### Component Prop Schemas

**Example: HeroBlock Props** ([spec.md FR-13](../specs/spec.md#L296-299) prop validation):

```typescript
import { z } from 'zod';

/**
 * HeroBlock component props schema
 * Context: shadcn patterns, Puck fields, inline editing
 */
const HeroPropsSchema = z.object({
  /** Main headline (supports inline editing via Puck 0.20) */
  title: z.string().min(1, "Title is required").max(100, "Title too long"),

  /** Supporting subtitle text */
  subtitle: z.string().max(200, "Subtitle too long").optional(),

  /** CTA button text */
  ctaText: z.string().min(1, "CTA text required").max(30, "CTA text too long"),

  /** CTA button destination URL */
  ctaUrl: z.string().url("Must be valid URL"),

  /** Background image URL (optional) */
  backgroundImage: z.string().url("Must be valid URL").optional(),

  /** Text alignment (left, center, right) */
  align: z.enum(['left', 'center', 'right']).default('center'),
});

type HeroProps = z.infer<typeof HeroPropsSchema>;

// Runtime validation example
const validateHeroProps = (props: unknown): HeroProps => {
  return HeroPropsSchema.parse(props); // Throws ZodError if invalid
};
```

**Example: GridBlock with Slot** ([spec.md FR-4](../specs/spec.md#L243-246) Slot API):

```typescript
/**
 * GridBlock props with nested Slot (Context: Puck 0.19 Slots API)
 * Reference: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-019.md
 */
interface GridProps {
  /** Number of columns (1-4) */
  columns: 1 | 2 | 3 | 4;

  /** Gap size between items (maps to Tailwind gap classes) */
  gap: 'sm' | 'md' | 'lg' | 'xl';

  /** Nested components via Slot field (Puck 0.19+ Slot API) */
  items: {
    type: string;
    props: Record<string, any>;
  }[];
}

// Puck ComponentConfig with Slot field
const GridBlock: ComponentConfig<GridProps> = {
  fields: {
    columns: {
      type: 'select',
      options: [
        { label: '1 Column', value: 1 },
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
      ],
    },
    gap: {
      type: 'radio',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' },
      ],
    },
    items: {
      type: 'slot', // Puck 0.19+ Slot field for nesting
      label: 'Grid Items',
      // Optional: Restrict allowed component types
      allowedComponents: ['CardBlock', 'ImageBlock', 'TextBlock'],
    },
  },
  defaultProps: {
    columns: 3,
    gap: 'md',
    items: [],
  },
  render: ({ columns, gap, items }) => (
    <div className={cn(
      'grid',
      `grid-cols-${columns}`,
      `gap-${gap}`,
    )}>
      {items.map((item, idx) => (
        <div key={idx}>{/* Puck renders nested component here */}</div>
      ))}
    </div>
  ),
};
```

---

### Metadata Schema

**Component Metadata** (Context: [Puck 0.19 metadata API](../contexts/context.md#L67-69)):

```typescript
/**
 * Component metadata for Puck inspector
 * Reference: projects/Puck_Docs/sessions/session-01/contexts/firecrawl_puck-019.md
 */
interface ComponentMeta {
  /** Display name in component list (defaults to component key) */
  label?: string;

  /** Category for grouping (Content, Layout, Widgets, etc.) */
  category?: string;

  /** Icon identifier (emoji or icon library key) */
  icon?: string;

  /** Description shown in tooltip on hover */
  description?: string;
}

// Usage in ComponentConfig
const HeroBlock: ComponentConfig<HeroProps> = {
  label: 'Hero Section',
  category: 'Content',
  icon: '🎯',
  description: 'Large hero section with headline, subtitle, and CTA',
  fields: { /* ... */ },
  render: ({ /* ... */ }) => { /* ... */ },
};
```

---

## 4. API Contracts

### ComponentConfig API (Primary Interface)

**Context Reference**: [Puck component configuration](../contexts/context.md#L86), [spec.md FR-1](../specs/spec.md#L224-227)

```typescript
/**
 * Puck ComponentConfig interface (all Tier 2 blocks implement this)
 * Reference: @measured/puck package types
 */
interface ComponentConfig<Props = any> {
  /** Field definitions for user input in Puck sidebar */
  fields: Record<string, Field>;

  /** Default prop values when component is first added to page */
  defaultProps?: Props;

  /** Render function (receives props, returns JSX) */
  render: (props: Props) => JSX.Element;

  /** Optional: Async data resolution (fetch external data before render) */
  resolveData?: (props: Props, params: ResolveDataParams) => Promise<Props>;

  /** Optional: Metadata for Puck UI (label, category, icon, description) */
  label?: string;
  category?: string;
  icon?: string;
  description?: string;
}
```

**Example Usage**:

```typescript
export const CardBlock: ComponentConfig<CardProps> = {
  label: 'Feature Card',
  category: 'Content',
  icon: '🃏',
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    icon: { type: 'text', label: 'Icon (emoji or URL)' },
  },
  defaultProps: {
    title: 'Feature Title',
    description: 'Describe the feature here',
    icon: '🚀',
  },
  render: ({ title, description, icon }) => (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  ),
};
```

---

### Field Types API

**Context Reference**: [Puck fields](../contexts/context.md#L90), [spec.md FR-4/FR-5/FR-6](../specs/spec.md#L243-256)

**Standard Fields**:
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `number`: Numeric input with optional min/max/step
- `select`: Dropdown selection with options array
- `checkbox`: Boolean toggle
- `radio`: Radio button group
- `external`: Async data fetching (e.g., image picker, page selector)

**Advanced Fields** (Puck 0.19+):
- `slot`: Nested component area ([spec.md FR-4](../specs/spec.md#L243-246))
- `inline`: ContentEditable field for WYSIWYG editing ([spec.md FR-5](../specs/spec.md#L248-251))
- `array`: Repeatable field groups (e.g., button list, testimonials)

**Example: Slot Field**:

```typescript
fields: {
  items: {
    type: 'slot',
    label: 'Grid Items',
    // Optional: Restrict allowed component types
    allowedComponents: ['CardBlock', 'ImageBlock', 'TextBlock'],
    // Optional: Set max items
    max: 12,
  },
}
```

**Example: Inline Field** (Puck 0.20+):

```typescript
fields: {
  title: {
    type: 'inline',
    label: 'Headline (editable in preview)',
    // Optional: Toolbar config for rich text
    toolbar: ['bold', 'italic', 'link'],
  },
}
```

**Example: Array Field**:

```typescript
fields: {
  buttons: {
    type: 'array',
    label: 'Buttons',
    // Fields for each array item
    arrayFields: {
      text: { type: 'text', label: 'Button Text' },
      url: { type: 'text', label: 'URL' },
      variant: {
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
      },
    },
    defaultItemProps: {
      text: 'Click here',
      url: '#',
      variant: 'primary',
    },
  },
}
```

---

### Config API (Type-Safe)

**Context Reference**: [TypeScript integration](../contexts/context.md#L71-73), [spec.md FR-12](../specs/spec.md#L291-294)

```typescript
import { Config } from '@measured/puck';

/**
 * Type-safe Puck configuration (MUST use for FR-12 strict type safety)
 */
type Components = {
  HeroBlock: HeroProps;
  CardBlock: CardProps;
  GridBlock: GridProps;
  TextBlock: TextProps;
  ImageBlock: ImageProps;
  ContainerBlock: ContainerProps;
  // ... all registered components
};

const puckConfig: Config<Components> = {
  components: {
    HeroBlock,
    CardBlock,
    GridBlock,
    TextBlock,
    ImageBlock,
    ContainerBlock,
  },
  categories: {
    Content: {
      components: ['HeroBlock', 'CardBlock', 'TextBlock'],
      title: 'Content Blocks',
    },
    Layout: {
      components: ['GridBlock', 'ContainerBlock'],
      title: 'Layout Components',
    },
    Media: {
      components: ['ImageBlock'],
      title: 'Media',
    },
  },
  // Optional: Root-level config for page metadata
  root: {
    fields: {
      title: { type: 'text', label: 'Page Title' },
      description: { type: 'textarea', label: 'Page Description' },
    },
  },
};
```

---

### PageData Import/Export API

**Context Reference**: [spec.md FR-8](../specs/spec.md#L263-266), [spec.md US-8](../specs/spec.md#L211-216)

**Export API**:

```typescript
/**
 * Serialize PageData to JSON string
 * @param data - Puck Data<Components> object
 * @param prettyPrint - Format JSON with indentation (default: true)
 * @returns JSON string
 */
export function exportPageData<T>(
  data: Data<T>,
  prettyPrint: boolean = true
): string {
  return JSON.stringify(data, null, prettyPrint ? 2 : 0);
}

// Usage
const json = exportPageData(currentPageData);
// Download as file
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'page-data.json';
link.click();

// Or POST to API
await fetch('/api/pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: json,
});
```

**Import API**:

```typescript
import { z } from 'zod';

/**
 * Parse and validate PageData from JSON string
 * @param json - JSON string
 * @param schema - Optional Zod schema for validation (FR-13)
 * @returns Validated Data<Components> object
 * @throws Error if JSON is invalid or fails validation
 */
export function importPageData<T>(
  json: string,
  schema?: z.ZodSchema
): Data<T> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }

  if (schema) {
    try {
      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
        throw new Error(`Validation failed:\n${issues.join('\n')}`);
      }
      throw error;
    }
  }

  return parsed as Data<T>;
}

// Usage with validation
const PageDataSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    props: z.record(z.any()),
  })),
  root: z.object({
    props: z.record(z.any()).optional(),
  }),
});

const pageData = importPageData<Components>(jsonString, PageDataSchema);
```

---

### Tree Traversal API

**Context Reference**: [spec.md FR-7](../specs/spec.md#L258-261), [Puck 0.19 walkTree](../contexts/context.md#L67-69)

```typescript
import { walkTree } from '@measured/puck';

/**
 * Traverse nested component tree and apply transformation
 * @param data - PageData to traverse
 * @param callback - Function called for each component
 * @returns Transformed PageData
 */
export function validateComponentTree<T>(data: Data<T>): ValidationResult[] {
  const errors: ValidationResult[] = [];

  walkTree(data, (node, parents) => {
    // Validation: Check for required ID
    if (!node.props.id) {
      errors.push({
        component: node.type,
        path: parents.map(p => p.type).join(' > '),
        error: 'Missing id prop',
      });
    }

    // Validation: Check nesting depth
    if (parents.length > 10) {
      errors.push({
        component: node.type,
        path: parents.map(p => p.type).join(' > '),
        error: 'Nesting depth exceeds 10 levels',
      });
    }

    return node; // Return transformed node or original
  });

  return errors;
}

// Example: Transform tree (add timestamps)
export function addTimestamps<T>(data: Data<T>): Data<T> {
  return walkTree(data, (node) => {
    return {
      ...node,
      props: {
        ...node.props,
        _timestamp: Date.now(),
      },
    };
  });
}
```

---

### Error Handling Patterns

**Validation Errors** ([spec.md FR-13](../specs/spec.md#L296-299)):
- Prop validation failures throw descriptive errors at dev time
- Runtime validation (Zod parse) returns error objects with field-level messages

**Field Resolution Errors** (resolveData):
- Network failures logged to console, fallback to defaultProps
- External field errors display error state in Puck UI

**Import/Export Errors**:
- Invalid JSON throws parse error with line/column info
- Schema validation errors list all failing fields

```typescript
// Example error handling
try {
  const pageData = importPageData(jsonString, PageDataSchema);
  console.log('Imported successfully:', pageData);
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Display validation errors to user
    console.error('Schema validation errors:', error.message);
  } else if (error.message.includes('Invalid JSON')) {
    // Display JSON parse error
    console.error('JSON parse error:', error.message);
  } else {
    // Unknown error
    console.error('Import failed:', error);
  }
}
```

---

## 5. Test Strategy

**IDSE Mandate**: Test-first mindset - define validation before implementation ([IDSE Article IV](../../docs/02-idse-constitution.md))

### 1. Documentation Test Examples (Unit Level)

**Tooling**: Jest + React Testing Library
**Context Reference**: [Intent - unit tests](../intents/intent.md#L25), [Context - Technical Environment](../contexts/context.md#L46), [spec.md FR-16](../specs/spec.md#L315-318)

**Example: CardBlock Render Test**:

```typescript
import { render, screen } from '@testing-library/react';
import { CardBlock } from './Card';

describe('CardBlock', () => {
  it('renders with default props', () => {
    const { render: renderFn, defaultProps } = CardBlock;
    const { container } = render(renderFn(defaultProps!));

    expect(screen.getByText('Feature Title')).toBeInTheDocument();
    expect(screen.getByText(/Describe the feature/)).toBeInTheDocument();
    expect(container.querySelector('[data-component="CardBlock"]')).toBeTruthy();
  });

  it('renders custom icon', () => {
    const { render: renderFn } = CardBlock;
    render(renderFn({
      title: 'Custom Card',
      description: 'Test description',
      icon: '🎉'
    }));

    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('applies correct Tailwind classes', () => {
    const { render: renderFn } = CardBlock;
    const { container } = render(renderFn(CardBlock.defaultProps!));

    const card = container.querySelector('.border');
    expect(card).toHaveClass('rounded-lg', 'shadow-sm');
  });
});
```

**Coverage Target**: 80%+ for component render functions ([spec.md NFR-7](../specs/spec.md#L368-371))

---

### 2. Storybook Story Specifications (Visual Testing)

**Tooling**: Storybook CSF3, a11y addon
**Context Reference**: [spec.md FR-15](../specs/spec.md#L310-313), [spec.md US-4](../specs/spec.md#L175-180)

**Example: CardBlock Stories**:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { CardBlock } from './Card';

const meta: Meta<typeof CardBlock.render> = {
  title: 'Blocks/CardBlock',
  component: CardBlock.render,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Feature card with icon, title, and description. Used for callouts, feature grids, or service listings.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Emoji or image URL for card icon',
    },
    title: {
      control: 'text',
      description: 'Card heading (max 50 characters)',
    },
    description: {
      control: 'text',
      description: 'Card body text (max 200 characters)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: CardBlock.defaultProps,
};

export const WithImageIcon: Story = {
  args: {
    ...CardBlock.defaultProps,
    icon: 'https://via.placeholder.com/48',
    title: 'Premium Feature',
    description: 'Unlock advanced capabilities with our premium tier',
  },
};

export const LongDescription: Story = {
  args: {
    title: 'Complex Feature',
    description: 'This is a much longer description that tests how the card handles overflow and text wrapping in various viewport sizes. It should truncate or wrap appropriately based on the design system.',
    icon: '📚',
  },
};

export const InGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <CardBlock.render key={i} {...CardBlock.defaultProps!} title={`Feature ${i}`} />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
```

**Validation**:
- Storybook runs with zero a11y violations ([spec.md NFR-3](../specs/spec.md#L340-343))
- All components have Default, Variants, Edge Cases stories ([spec.md FR-15](../specs/spec.md#L310-313))

---

### 3. TypeScript Schema Validation

**Tooling**: Zod or Yup, tsc --noEmit
**Context Reference**: [spec.md FR-13](../specs/spec.md#L296-299), [spec.md NFR-5](../specs/spec.md#L354-357)

**Example: Prop Schema Validation Test**:

```typescript
import { HeroPropsSchema } from './schemas';

describe('HeroPropsSchema', () => {
  it('validates correct props', () => {
    const validProps = {
      title: 'Welcome',
      subtitle: 'Get started today',
      ctaText: 'Click here',
      ctaUrl: 'https://example.com',
      align: 'center',
    };

    expect(() => HeroPropsSchema.parse(validProps)).not.toThrow();
  });

  it('rejects invalid URL', () => {
    const invalidProps = {
      title: 'Welcome',
      ctaText: 'Click',
      ctaUrl: 'not-a-url', // Invalid
    };

    expect(() => HeroPropsSchema.parse(invalidProps)).toThrow('Must be valid URL');
  });

  it('enforces title length constraints', () => {
    const tooLong = {
      title: 'A'.repeat(101), // Max 100
      ctaText: 'Click',
      ctaUrl: 'https://example.com',
    };

    expect(() => HeroPropsSchema.parse(tooLong)).toThrow('Title too long');
  });

  it('provides default for align if not specified', () => {
    const props = {
      title: 'Test',
      ctaText: 'Click',
      ctaUrl: 'https://example.com',
    };

    const result = HeroPropsSchema.parse(props);
    expect(result.align).toBe('center');
  });
});
```

**Validation**:
- `tsc --noEmit` passes with strict: true ([spec.md NFR-5](../specs/spec.md#L354-357))
- Schema tests cover valid, invalid, edge cases for all props

---

### 4. Integration Testing (Puck Editor Interactions)

**Tooling**: Jest + Testing Library, Puck test utilities
**Context Reference**: [spec.md FR-4](../specs/spec.md#L243-246) (Slot API), [spec.md FR-5](../specs/spec.md#L248-251) (inline editing)

**Example: Slot Field Integration**:

```typescript
import { render, screen } from '@testing-library/react';
import { Puck } from '@measured/puck';
import { puckConfig } from './config';

describe('GridBlock with Slot integration', () => {
  it('renders nested CardBlocks in GridBlock', () => {
    const testData = {
      content: [
        {
          type: 'GridBlock',
          props: {
            id: 'grid-1',
            columns: 2,
            gap: 'md',
            items: [
              {
                type: 'CardBlock',
                props: {
                  id: 'card-1',
                  title: 'Card 1',
                  description: 'First card',
                  icon: '🎯',
                }
              },
              {
                type: 'CardBlock',
                props: {
                  id: 'card-2',
                  title: 'Card 2',
                  description: 'Second card',
                  icon: '🚀',
                }
              },
            ],
          },
        },
      ],
      root: { props: {} },
    };

    render(<Puck config={puckConfig} data={testData} />);

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('First card')).toBeInTheDocument();
    expect(screen.getByText('Second card')).toBeInTheDocument();
  });

  it('respects columns prop on GridBlock', () => {
    const testData = {
      content: [
        {
          type: 'GridBlock',
          props: {
            id: 'grid-1',
            columns: 4,
            gap: 'lg',
            items: [
              { type: 'CardBlock', props: { id: 'card-1', title: 'Card 1' } },
            ],
          },
        },
      ],
      root: { props: {} },
    };

    const { container } = render(<Puck config={puckConfig} data={testData} />);
    const grid = container.querySelector('.grid');

    expect(grid).toHaveClass('grid-cols-4');
    expect(grid).toHaveClass('gap-lg');
  });
});
```

**Validation Checklist**:
- [ ] Slot fields render nested components correctly
- [ ] Inline fields allow contentEditable interactions
- [ ] Overlay portals (Select, Popover) don't trigger Puck overlay
- [ ] PageData serialization/deserialization preserves structure
- [ ] walkTree correctly traverses nested component trees

---

### 5. Accessibility Audits

**Tooling**: Storybook a11y addon, axe-core, manual keyboard testing
**Context Reference**: [spec.md NFR-3](../specs/spec.md#L340-343), [spec.md NFR-4](../specs/spec.md#L345-348)

**Automated Audit** (Storybook):
```typescript
// .storybook/preview.ts
export const parameters = {
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
      ],
    },
  },
};
```

**Manual Keyboard Testing Checklist**:
- [ ] **Tab key** navigates through all interactive elements in logical order
- [ ] **Enter/Space** activates buttons, checkboxes, toggles
- [ ] **Escape** closes Popover, Modal overlays, dismisses tooltips
- [ ] **Arrow keys** navigate Select dropdowns, Tab panels, radio groups
- [ ] **Focus visible** on all interactive elements (blue outline, ring class)
- [ ] **No keyboard traps** - user can navigate in and out of all components
- [ ] **Screen reader** announces labels, roles, states correctly (NVDA/JAWS/VoiceOver)

**Validation**: Zero axe-core violations, 100% keyboard navigability ([spec.md NFR-3](../specs/spec.md#L340-343), [spec.md NFR-4](../specs/spec.md#L345-348))

---

### 6. Performance Benchmarking

**Tooling**: Chrome DevTools Performance profiler, Jest benchmarks
**Context Reference**: [spec.md NFR-1](../specs/spec.md#L326-329), [spec.md NFR-2](../specs/spec.md#L331-334)

**Example: Large Page Render Benchmark**:

```typescript
import { render } from '@testing-library/react';
import { Puck } from '@measured/puck';
import { puckConfig } from './config';

describe('Performance: Large page rendering', () => {
  it('renders 50+ components at 60fps (NFR-1)', () => {
    const largePageData = {
      content: Array.from({ length: 50 }, (_, i) => ({
        type: 'CardBlock',
        props: {
          id: `card-${i}`,
          title: `Card ${i}`,
          description: `Description for card ${i}`,
          icon: '🚀',
        },
      })),
      root: { props: {} },
    };

    const start = performance.now();
    render(<Puck config={puckConfig} data={largePageData} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(16.67); // 60fps = 16.67ms per frame
  });
});
```

**Example: walkTree Benchmark**:

```typescript
import { walkTree } from '@measured/puck';

describe('Performance: Tree traversal (NFR-2)', () => {
  it('processes 100-node tree in <50ms', () => {
    const deepTree = createNestedTree(100); // Helper to generate test data

    const start = performance.now();
    walkTree(deepTree, (node) => node); // No-op transformation
    const end = performance.now();

    expect(end - start).toBeLessThan(50);
  });

  it('handles deeply nested structures efficiently', () => {
    const deepNesting = createDeeplyNestedTree(10); // 10 levels deep

    const start = performance.now();
    const result = walkTree(deepNesting, (node, parents) => {
      return { ...node, depth: parents.length };
    });
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Reasonable threshold for deep nesting
    expect(result).toBeDefined();
  });
});
```

**Validation**: 60fps for 50+ components ([spec.md NFR-1](../specs/spec.md#L326-329)), <50ms tree traversal for 100 nodes ([spec.md NFR-2](../specs/spec.md#L331-334))

---

### Test Execution Strategy

**Phase 0 (Foundations)**: Schema validation tests, TypeScript compilation checks
**Phase 1 (Core Behavior)**: Unit tests for component render, Storybook stories
**Phase 2 (NFRs/Hardening)**: Integration tests, a11y audits, performance benchmarks

**Success Criteria**:
- 80%+ code coverage for documented components ([spec.md NFR-7](../specs/spec.md#L368-371))
- 100% Storybook a11y addon pass rate ([spec.md NFR-3](../specs/spec.md#L340-343))
- All performance benchmarks within target thresholds ([spec.md NFR-1/NFR-2](../specs/spec.md#L326-334))
- All TypeScript examples compile with strict mode ([spec.md NFR-5](../specs/spec.md#L354-357))

---

## 6. Phases

### Phase 0: Foundations (Architecture & Schemas)

**Goal**: Establish type-safe foundation and documented patterns

**Deliverables** (Documentation):

1. **TypeScript Interface Definitions** ([spec.md FR-12](../specs/spec.md#L291-294), [spec.md NFR-5](../specs/spec.md#L354-357))
   - `Data<Components>`, `ComponentData<T>`, `RootData` interfaces
   - `ComponentConfig<Props>` interface with field definitions
   - Field type interfaces (`slot`, `inline`, `external`, `array`)
   - Zod/Yup prop schemas for validation ([spec.md FR-13](../specs/spec.md#L296-299))

2. **Architecture Diagrams** (Section 1 above)
   - Three-tier component architecture (ASCII diagram)
   - Component interaction flow (developer → Puck → PageData → render)
   - Puck editor integration points

3. **API Contract Documentation** (Section 4 above)
   - ComponentConfig API with usage examples
   - Field types reference (text, textarea, slot, inline)
   - PageData import/export function signatures
   - walkTree utility API documentation

4. **Design Decision Records** (Section 1 above)
   - Radix + shadcn rationale and tradeoffs
   - Slot API vs DropZones migration notes
   - Tailwind v4 safelist strategy decision matrix (see [spec.md OQ-1](../specs/spec.md#L483-489))
   - Documentation-only scope clarification

**Dependencies**: Completed [spec.md](../specs/spec.md) (FR/NFR requirements) ✅
**Validation**: TypeScript interfaces compile, schemas documented, no template placeholders

**Estimated Deliverables**: 4 markdown documents + 3 TypeScript interface examples

---

### Phase 1: Core Behavior (Component Documentation)

**Goal**: Document all 3 tiers of components with implementation examples

**Deliverables** (Documentation):

#### 1.1 Tier 1: Primitive Components ([spec.md FR-2](../specs/spec.md#L229-232), [spec.md FR-11](../specs/spec.md#L282-285))

Document **10 Radix primitives** with shadcn patterns:
- Button (variants, sizes, disabled state)
- Input (label, validation, helper text)
- Card (Header, Content, Footer composition)
- Select (with overlay portal registration - [spec.md FR-6](../specs/spec.md#L253-256))
- Textarea (auto-resize behavior)
- Checkbox (indeterminate state)
- Tabs (keyboard navigation)
- Tooltip (delay, positioning)
- Popover (with overlay portal - [spec.md FR-6](../specs/spec.md#L253-256))
- Separator (horizontal/vertical)

**For each component**:
- Reference existing implementation at `/frontend/widget/src/components/ui/`
- Document cn() utility usage pattern ([spec.md FR-11](../specs/spec.md#L282-285))
- CSS variable theming examples ([spec.md FR-10](../specs/spec.md#L277-280))

#### 1.2 Tier 2: Styled Block Components ([spec.md FR-1](../specs/spec.md#L224-227), [spec.md FR-4](../specs/spec.md#L243-246), [spec.md FR-5](../specs/spec.md#L248-251))

Document **10 Puck-compatible blocks**:
- **HeroBlock** (with inline editing for title/subtitle - [spec.md FR-5](../specs/spec.md#L248-251))
- **CardBlock** (existing reference at `/frontend/widget/src/puck/components/Card.tsx`)
- **GridBlock** (with Slot field for nested components - [spec.md FR-4](../specs/spec.md#L243-246))
- **TextBlock** (inline WYSIWYG editing - [spec.md FR-5](../specs/spec.md#L248-251))
- **ImageBlock** (external field for image picker)
- **ContainerBlock** (Slot field with padding/margin props)
- **ButtonGroupBlock** (array field for multiple buttons)
- **AccordionBlock** (collapsible sections)
- **TabsBlock** (Slot fields for tab panels - [spec.md FR-4](../specs/spec.md#L243-246))
- **ChatWidgetBlock** (existing reference)

**For each component**:
- ComponentConfig code example
- Field definitions (type, label, validation)
- defaultProps object
- render function implementation
- Storybook story outline ([spec.md FR-15](../specs/spec.md#L310-313))

#### 1.3 Tier 3: Page Compositions ([spec.md FR-8](../specs/spec.md#L263-266), [spec.md US-8](../specs/spec.md#L211-216))

Document **5 page-level compositions**:
- PageDataImporter/Exporter usage examples
- PuckConfigFactory helper documentation
- TreeValidator walkTree examples ([spec.md FR-7](../specs/spec.md#L258-261))
- PageBuilder integration guide
- Type-safe config generation patterns

**Dependencies**: Phase 0 (schemas, interfaces) ✅
**Validation**: All components have ComponentConfig examples, context references, no placeholders

**Estimated Deliverables**: 25 component documentation files (10 primitives + 10 blocks + 5 compositions)

---

### Phase 2: NFRs & Hardening (Testing, Accessibility, Performance)

**Goal**: Document validation, accessibility, and performance strategies

**Deliverables** (Documentation):

#### 2.1 Test Documentation ([spec.md FR-15](../specs/spec.md#L310-313), [spec.md FR-16](../specs/spec.md#L315-318), [spec.md NFR-7](../specs/spec.md#L368-371))

- **Unit test examples** for 10+ components (Jest + Testing Library)
  - Component render tests
  - Props validation tests
  - User interaction tests
- **Storybook story specifications** (CSF3 format, args, decorators)
  - Default, Variants, Edge Cases stories
  - Autodocs configuration
- **Schema validation test examples** (Zod parse, error handling)
- **Integration test examples** (Slot nesting, inline editing, overlay portals)

**File**: `implementation/test-examples.md`

#### 2.2 Accessibility Guidelines ([spec.md NFR-3](../specs/spec.md#L340-343), [spec.md NFR-4](../specs/spec.md#L345-348))

- **Storybook a11y addon configuration** (.storybook/preview.ts)
- **Keyboard navigation testing checklist** (Tab/Enter/Escape/Arrow keys for 10+ components)
- **ARIA attribute requirements** for custom components
- **WCAG 2.1 AA compliance verification approach** (axe-core, manual testing)

**File**: `implementation/accessibility-guidelines.md`

#### 2.3 Performance Documentation ([spec.md NFR-1](../specs/spec.md#L326-329), [spec.md NFR-2](../specs/spec.md#L331-334))

- **Large page rendering benchmark** approach (60fps target, Chrome DevTools profiling guide)
- **walkTree efficiency guidelines** (<50ms benchmark for 100-node tree)
- **Code-splitting and lazy-loading recommendations** for large component libraries

**File**: `implementation/performance-guidelines.md`

#### 2.4 TypeScript Strictness ([spec.md NFR-5](../specs/spec.md#L354-357))

- **tsc --noEmit verification steps** (TypeScript compilation checks)
- **Strict mode configuration guide** (tsconfig.json settings)
- **Type inference best practices** (avoiding `any`, using generics)

**File**: `implementation/typescript-guidelines.md`

#### 2.5 Tailwind v4 Strategy Documentation ([spec.md FR-9](../specs/spec.md#L272-275), [spec.md OQ-1](../specs/spec.md#L483-489))

- **Safelist file approach** (pros/cons, setup instructions)
- **CDN approach** (runtime class generation tradeoffs)
- **Static class presets** (bundle size vs flexibility)
- **Decision matrix** with recommendations for different team sizes/page counts

**File**: `implementation/tailwind-strategy.md`

**Dependencies**: Phase 1 (components documented) ✅
**Validation**: Test examples documented, NFR measurement approaches defined, decision matrices completed

**Estimated Deliverables**: 5 guideline documents (test examples, accessibility, performance, TypeScript, Tailwind)

---

### Phase 3: Cleanup & Handoff (Documentation Review)

**Goal**: Finalize documentation and prepare for IDE team handoff

**Deliverables** (Documentation):

#### 3.1 Documentation Review Checklist ([spec.md NFR-7](../specs/spec.md#L368-371), [spec.md NFR-8](../specs/spec.md#L373-376))

- [ ] All 8 user stories addressed in FRs (see [spec.md AC-1](../specs/spec.md#L396-410))
- [ ] All 16 FRs have context references (see [spec.md FR-1 through FR-16](../specs/spec.md#L224-318))
- [ ] All 10 NFRs have measurement criteria (see [spec.md NFR-1 through NFR-10](../specs/spec.md#L326-390))
- [ ] Component table lists 27+ components (10 primitives, 15+ blocks, 5 compositions) (see Section 2 above)
- [ ] API contracts have usage examples (see Section 4 above)
- [ ] Test strategy has examples for all 6 validation approaches (see Section 5 above)
- [ ] No template placeholders remain (all "..." replaced with actual content)

**File**: `implementation/validation-reports/completeness-checklist.md`

#### 3.2 Handoff Package

- **`implementation/README.md`** - Summary of all deliverables
  - Overview of component library scope
  - References to spec.md, plan.md, tasks.md
  - Pointers to existing codebase examples (`/frontend/widget/src/puck/`, `/frontend/widget/src/components/ui/`)
  - Next steps for IDE team (code implementation phases)
  - Link to handoff meeting notes (if applicable)

- **`implementation/validation-reports/task-completion.md`** - Confirms all tasks done
  - Phase 0 tasks completed ✅
  - Phase 1 tasks completed ✅
  - Phase 2 tasks completed ✅
  - Phase 3 tasks completed ✅

- **`implementation/validation-reports/context-reference-index.md`** - Provenance tracking
  - List of all Context references used in spec/plan
  - Mapping of FRs to Context research (Puck 0.19, Puck 0.20, shadcn patterns, Tailwind v4)

**Files**: `implementation/README.md`, `implementation/validation-reports/task-completion.md`, `implementation/validation-reports/context-reference-index.md`

#### 3.3 Open Questions Resolution

- Review [spec.md OQ-1 through OQ-5](../specs/spec.md#L483-521)
- Document recommendations or "deferred to IDE team" decisions
- Update spec.md if any assumptions change based on team feedback

**File**: `implementation/open-questions-resolution.md`

**Dependencies**: Phase 2 (NFR documentation) ✅
**Validation**: Peer review confirms completeness, handoff package ready for IDE team, all open questions addressed

**Estimated Deliverables**: 5 handoff documents (README, checklists, validation reports, context index, open questions)

---

### Phase Sequencing

```
Phase 0 (Foundations)
  ↓
Phase 1 (Core Behavior) - can parallelize component documentation after interfaces done
  ↓
Phase 2 (NFRs/Hardening) - can parallelize test/a11y/performance docs
  ↓
Phase 3 (Cleanup) - sequential review and handoff
```

**Critical Path**: spec.md ✅ → Phase 0 schemas → Phase 1 components → Phase 2 tests → Phase 3 handoff

**Parallelization Opportunities**:
- **Phase 1**: Tier 1, Tier 2, Tier 3 can be documented in parallel (assign to different team members)
- **Phase 2**: Test, a11y, performance docs can be written in parallel (no inter-dependencies)

**Documentation Freeze**: After Phase 3 review, spec/plan/tasks become **immutable references** for implementation. Any changes require new IDSE session.

---

**Note:** This plan is **documentation** that guides the IDE/development team. The actual code, schemas, and configurations will be created by the development team in the appropriate codebase directories (`/frontend/widget/src/puck/`, `/frontend/widget/src/components/ui/`, etc.). All artifacts produced in this IDSE session live under `/projects/IDSE_Core/sessions/puck-components/implementation/` as markdown documentation files.
