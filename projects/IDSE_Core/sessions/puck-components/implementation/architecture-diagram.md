# Task 0.4 — Three-Tier Architecture Diagram

Purpose: visualize how primitives, blocks, and compositions interact through Puck Config and PageData flows.

## Mermaid Diagram

```mermaid
flowchart LR
  subgraph Tier1[Primitives]
    Button --> cn
    Input --> cn
    Card --> cn
    Tabs --> cn
  end

  subgraph Tier2[Blocks]
    HeroBlock --> Button
    CardBlock --> Card
    GridBlock --> CardBlock
    TextBlock --> inline
    ImageBlock --> external
    ContainerBlock --> Slot
  end

  subgraph Tier3[Compositions]
    PageDataImporter --> GridBlock
    PageDataExporter --> GridBlock
    PuckConfigFactory --> HeroBlock
    TreeValidator --> GridBlock
  end

  Tier1 --> Tier2 --> Tier3
  cn[cn() utility] -.-> Tailwind
  Slot[Slot field] -.-> Tier2
  inline[Inline field] -.-> Tier2
  external[External field] -.-> Tier2
  Tailwind -. styling .-> Tier2
  PuckConfigFactory --> PuckConfig[(Config<Components>)]
  PuckConfig --> PuckEditor[(Puck Editor)]
  PuckEditor --> PageData[(PageData JSON)]
  PageDataImporter --> PageData
  PageDataExporter --> PageData
  TreeValidator --> PageData
```

## Interaction Flow

- **Primitives** (Radix + shadcn patterns) expose consistent props and Tailwind class tokens via `cn()`; they never depend on Puck directly.
- **Blocks** compose primitives and register fields in `ComponentConfig` (Slot/inline/external support); they write to `PageData` through Puck editor interactions.
- **Compositions** wrap PageData operations: import/export, config factory, and tree validation (walkTree). They consume documented interfaces, not runtime production code.
- **Data Path**: Config → Puck Editor → PageData JSON → Import/Export/Validation. Styling remains isolated to Tailwind tokens chosen per OQ-1 safelist decision.

## Acceptance Mapping

- Diagram covers three tiers and their dependencies (Plan Section 1).
- Flow notes describe how Puck Config, PageData, and Tailwind interact, satisfying Task 0.4 acceptance for diagram + interaction description.
