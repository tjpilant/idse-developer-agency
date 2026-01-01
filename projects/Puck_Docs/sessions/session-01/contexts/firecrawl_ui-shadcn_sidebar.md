# Source: https://ui.shadcn.com/docs/components/sidebar

Sidebar — shadcn/ui

Composable, themeable, customizable sidebar. Provides SidebarProvider, Sidebar, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup, SidebarMenu and helper components. Designed for app-level navigation and responsive layouts (collapsible, icon rail, off-canvas).

## Overview

The Sidebar package provides a set of composable primitives and helpers to build a robust application sidebar. Key goals: accessibility, themability, responsive behavior, and integration with other UI primitives (DropdownMenu, Collapsible, Dialog).

## Structure

- SidebarProvider — context provider that manages open/collapsed state, keyboard shortcut, and optional persisted state (cookie-based).
- Sidebar — container component (props: side, variant, collapsible) rendering header, content, footer.
- SidebarHeader / SidebarFooter — sticky header/footer regions.
- SidebarContent — scrollable region for groups and menus.
- SidebarGroup / SidebarGroupLabel / SidebarGroupAction — logical grouping of menu sections.
- SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuSub — menu primitives for navigation lists with optional badges, actions, and submenus.

## Key features

- Collapsible modes: icon rail (collapses to icons), offcanvas, or fixed.
- Persisted state: provider can persist open state across page loads via cookies.
- Responsive patterns: example provided for using Dialog on desktop and Drawer on mobile.
- Integrations: works with React Server Components, SWR/react-query for menu data, and other shadcn primitives.

## Example (conceptual)

```
<SidebarProvider>
  <Sidebar>
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild><Link href="/home">Home</Link></SidebarMenuButton>
            <SidebarMenuAction>...</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>...</SidebarFooter>
  </Sidebar>
</SidebarProvider>
```

## API notes

- useSidebar hook exposes state (open, openMobile, isMobile), setters (setOpen, setOpenMobile), toggleSidebar, and persisted APIs.
- Sidebar props: side (left|right), variant (sidebar|floating|inset), collapsible (offcanvas|icon|none).
- SidebarMenu items support `asChild` for link semantics, `isActive` to mark active items, and optional badges/actions.

## Theming & Styling

- Sidebar exposes CSS variables for widths and color tokens. The docs include guidance for using `--sidebar-width` and `--sidebar-width-mobile` and customizing sidebar colors separately from the rest of the app.
- Examples show how to style collapsed icon mode and active menu states.

## Accessibility & UX

- Keyboard shortcut support (cmd/ctrl + b) to toggle the sidebar in examples.
- Fieldset/landmark semantics and focus management handled via provided primitives.

## Implementation tips

- Use SidebarProvider at app root to share state across pages.
- For dynamic menus, render SidebarMenu items from RSC or client data hooks and show a Skeleton while loading.
- Combine with Collapsible for collapsible groups and DropdownMenu for item actions.

## References

- Source page: https://ui.shadcn.com/docs/components/sidebar
- Related: Drawer, Sheet, Dialog, Menu, Collapsible, Field components
