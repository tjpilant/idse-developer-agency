# POC: CardBlock Prototype (CardBlock inside GridBlock with Inline Edit)

Purpose

Create a focused proof-of-concept demonstrating key integration points: Slot nesting, inline editing (FieldTransforms), Storybook story, and a PageData round-trip test. This POC validates assumptions in the spec and reduces risk before full component implementation.

Scope (documentation-only)

- Describe the minimal CardBlock and GridBlock configuration for Puck.
- Provide Storybook CSF3 story templates (editor/preview modes).
- Provide a Jest test outline for PageData serialize → deserialize → render round-trip.
- Include acceptance criteria and expected outputs (docs, story, test examples).

Prerequisites

- Reference TypeScript interfaces: RootData, ComponentData, PageData (see implementation/typescript-interfaces.md)
- Storybook + Jest tooling available per Technical Environment

Storybook (CSF3) example (pseudo-code)

export default { title: 'POC/CardBlock/Editor', component: CardBlock }

export const Editor = {
  args: {
    puckMode: 'editor',
    config: {/* ComponentConfig for CardBlock */}
  },
  decorators: [/* wrap with Puck editor provider mock, registerOverlayPortal stub */]
}

export const Preview = { args: { puckMode: 'preview', config: {/* as rendered */} } }

Jest test outline (pseudo-code)

- Build PageData fixture (use canonical example from spec with hero/grid/cards)
- importPageData(fixture) -> produces in-memory Component tree
- Render minimal renderer that maps Component nodes -> React elements (documentation-only mock)
- Assert render output contains expected text/ids
- Serialize rendered tree back to PageData and assert equality (or schema-validated equivalence)

Acceptance criteria

- Storybook: Editor and Preview stories render without runtime errors in docs environment.
- Test: Round-trip serialize/deserialize passes schema validation (Zod) and retains component ids and props for the POC nodes.
- Docs: `implementation/pocs/poc-card.md` documents the example, story templates, and test outlines so an engineer can implement the prototype quickly.

Next steps for implementer

1. Implement CardBlock ComponentConfig example in implementation/blocks/card-block.md as a small example.
2. Add Storybook stories using the templates above and run storybook build.
3. Implement Jest round-trip test using PageData fixture from spec.
4. Report results and update spec/tasks with any discovered deviations.

