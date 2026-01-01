# Source: https://puckeditor.com/blog/puck-020

Puck 0.20: Inline text, overlay portals & resizable sidebars

Author: Chris Villa — Aug 14, 2025

Puck 0.20 introduces inline text editing, overlay portals for interacting with components in the preview, resizable sidebars, and several other improvements that make the editor more flexible for both users and developers.

Sections:
- What’s new in Puck 0.20
- Other changes
- How to upgrade
- Full changelog
- Contributors

## What's new in Puck 0.20

### Inline text editing

Inline text editing allows editing text, textarea, and custom fields directly in the preview by setting contentEditable to true in the field config. Note: render functions now receive React nodes instead of strings when contentEditable is enabled; update logic/types accordingly.

### FieldTransforms API: Modify field values

FieldTransforms API lets you modify the value that each field type provides to component render functions when used in the editor. Use to implement custom inline fields, e.g., rich text.

### New function: registerOverlayPortal

registerOverlayPortal excludes specific elements from the overlay so they remain interactive (useful for rich text, tabs). Example given for Accordion with summary ref registered.

### New function: setDeep

setDeep is a utility to set a value deep within an object (useful for nested data and field transforms).

### New override: componentOverlay

componentOverlay override customizes how the overlay renders when a component is hovered/selected. Example provided.

### Resizable sidebars

Sidebars can be resized by dragging. Sidebar widths accessible via internal PuckAPI (appState.ui.leftSideBarWidth/rightSideBarWidth).

### New bundle: no-external.css

Includes a CSS bundle that avoids importing CSS from CDNs; useful to host fonts locally.

### New CSS property: --puck-font-family

Allows changing font family when using no-external.css.

## Other changes

- migrate dynamic zones to slots (migrate helper supports migrateDynamicZonesForComponent option)
- add custom fields with overrides
- optional generics in Config and ComponentConfig types
- select and radio fields support null/undefined/object values

## How to upgrade

Follow the upgrade guide: https://puckeditor.com/blog/upgrading-to-puck-020

## Full changelog

See GitHub release: https://github.com/measuredco/puck/releases/tag/v0.20.0

## Contributors

- BAHAA-THE-KING
- shannonhochkins
- tlahmann
