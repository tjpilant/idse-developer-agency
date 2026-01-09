# Puck v0.20 Migration Guide

## Issue Summary

After updating from Puck v0.19 to v0.20, the editor cannot display pages or accept drops on the canvas. This is due to **breaking changes in Puck v0.20's layout system**.

---

## Breaking Changes in Puck v0.20

### 1. ❌ Custom Layout Pattern Removed

**v0.19 (OLD - No longer works)**:
```tsx
<Puck config={config} data={data}>
  <div className="custom-layout">
    <Puck.Components />  {/* ❌ Deprecated */}
    <Puck.Fields />      {/* ❌ Deprecated */}
    <Puck.Preview />     {/* ❌ Deprecated */}
  </div>
</Puck>
```

**v0.20 (NEW - Required)**:
```tsx
<Puck
  config={config}
  data={data}
  // Puck renders its own layout - no children allowed
/>
```

### 2. ✅ Use `overrides` for Customization

In v0.20, use the `overrides` prop to customize UI:

```tsx
<Puck
  config={config}
  data={data}
  overrides={{
    header: ({ children }) => (
      <div className="custom-header">{children}</div>
    ),
    actionBar: ({ children }) => (
      <div className="custom-actions">{children}</div>
    ),
    // Other overridable components:
    // - componentItem, fields, fieldLabel, components, outline, etc.
  }}
/>
```

### 3. ⚠️ Inline Editing Changes

**v0.19**: Used `contentEditable` field property
**v0.20**: Use `inline: true` at component config level

```tsx
// v0.20 pattern
export const Hero: ComponentConfig<HeroProps> = {
  inline: true,  // Enable inline editing for this component
  fields: {
    heading: {
      type: "text",
      label: "Heading",
      // contentEditable removed in v0.20
    },
  },
  render: ({ heading }) => <h1>{heading}</h1>
};
```

---

## What Was Fixed

### ✅ PuckEditor.tsx Changes

1. **Removed custom layout**:
   - Deleted `<Puck.Components />`, `<Puck.Fields />`, `<Puck.Preview />`
   - Removed custom panel layout (nav tabs, left panel, right panel)
   - Let Puck render its own default layout

2. **Fixed TypeScript errors**:
   - Created `ExtendedData` type for custom fields (`slug`, `title`, `schemaVersion`)
   - Updated state types from `Data` to `ExtendedData`
   - Removed unused imports and variables

3. **Simplified Puck invocation**:
```tsx
<div style={{ height: "calc(100vh - 96px)" }}>
  <Puck
    key={`puck-editor-${loadNonce}`}
    config={puckConfig}
    data={data}
    onChange={setData}
    viewports={[...]}
    iframe={{ enabled: false }}
  />
</div>
```

---

## What Still Needs Attention

### ⚠️ Lost Features (Need Alternative Implementation)

1. **Custom Left Panel Navigation** (tabs: Blocks/Fields/Outline)
   - **OLD**: Custom aside with tab buttons to switch panels
   - **NEW**: Puck v0.20 shows all 3 by default in left sidebar
   - **TODO**: If custom tabs needed, use `overrides.components`, `overrides.fields`, `overrides.outline`

2. **Right Panel for Chat Widget**
   - **OLD**: Custom 590px right panel with `<RightPanel />` chat
   - **NEW**: Puck v0.20 doesn't support custom right panels in core layout
   - **TODO Options**:
     - Option A: Use `overrides.header` to add chat icon that opens modal
     - Option B: Use floating chat widget (position: fixed)
     - Option C: Embed chat below editor or in separate browser window

3. **Custom Header/Action Bar**
   - **OLD**: Custom `<ApplicationShell>` header with publish/load/save
   - **NEW**: Puck v0.20 has its own header
   - **TODO**: Use `overrides.header` or `overrides.actionBar` to integrate custom controls

---

## Component-Level Changes Needed

### Hero.tsx, TextBlock.tsx (Inline Editing)

**Current state**: Already using v0.20 pattern ✅
```tsx
export const Hero: ComponentConfig<HeroProps> = {
  inline: true,  // ✅ Correct for v0.20
  fields: {
    heading: { type: "text", label: "Heading", contentEditable: true }, // ⚠️ Remove contentEditable
  },
};
```

**Fix needed**:
```tsx
export const Hero: ComponentConfig<HeroProps> = {
  inline: true,  // ✅ Keep this
  fields: {
    heading: { type: "text", label: "Heading" },  // ✅ Remove contentEditable
  },
};
```

---

## Testing Checklist

After migration, verify:

- [ ] **Editor loads** without console errors
- [ ] **Canvas displays** existing pages correctly
- [ ] **Drag & drop works** from components panel to canvas
- [ ] **Inline editing works** for Hero heading/subheading and TextBlock content
- [ ] **Fields panel** shows/updates component props
- [ ] **Outline panel** shows component tree
- [ ] **Viewports** switch correctly (Mobile/Tablet/Wide/Full)
- [ ] **Save/Load** still works with backend API
- [ ] **Publish dialog** functions correctly

---

## Next Steps (Priority Order)

### 1. Test Editor Functionality (IMMEDIATE)
```bash
cd frontend/widget
npm run dev
# Open http://localhost:5173/puck
# Try to drag a Hero component to canvas
# Verify inline editing works
```

### 2. Remove `contentEditable` from Component Fields (5 min)
- Edit: `frontend/widget/src/puck/components/Hero.tsx`
- Edit: `frontend/widget/src/puck/components/TextBlock.tsx`
- Remove `contentEditable: true` from field definitions (not needed in v0.20)

### 3. Restore Chat Panel (30-60 min)
Choose one approach:
- **Option A**: Floating chat button → modal (recommended)
- **Option B**: Chat in `overrides.header` as expandable panel
- **Option C**: Separate chat window (Browser API `window.open()`)

### 4. Restore Custom Header Controls (30 min)
Use `overrides.header` to add:
- Title/slug inputs
- Publish button
- Load pages button
- Copy link button
- New page button

Example:
```tsx
<Puck
  overrides={{
    header: ({ children }) => (
      <div className="flex items-center gap-4 p-4 border-b">
        {children}
        <button onClick={onPublish}>Publish</button>
        <button onClick={onLoadPages}>Load</button>
        {/* ... other controls */}
      </div>
    ),
  }}
/>
```

---

## Reference Documentation

- **Puck v0.20 Release Notes**: https://github.com/measuredco/puck/releases/tag/v0.20.0
- **Puck Overrides API**: https://puck.sh/docs/api/overrides
- **Inline Editing**: https://puck.sh/docs/integrating-puck/inline-editing
- **Migration Guide**: https://puck.sh/docs/migrating/0.20

---

## Current Status

✅ **Editor now loads** (custom layout removed, TypeScript errors fixed)
⚠️ **Lost features** (custom panels, chat widget, header controls)
🔄 **Next**: Test editor, remove contentEditable, restore UI features

**Estimated time to full restoration**: 2-3 hours
