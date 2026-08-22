# SidebarNav

Left sidebar navigation shown on desktop-width viewports (`md` breakpoint and up), replacing the mobile bottom tab bar. Rendered inside `App.tsx`'s `AppShell` alongside the bottom tab bar — both are always in the DOM, and Chakra's responsive `display` prop (`{ base: 'none', md: 'flex' }` on `SidebarNav`, `{ base: 'flex', md: 'none' }` on the bottom bar) picks the right one per viewport via CSS media query, so there's no JS breakpoint detection or layout flash.

## Props

- `items: SidebarNavItem[]` — nav entries (`label`, `path`, `icon`), each an Gravity UI icon component. `App.tsx` passes `SIDEBAR_TABS`, a top-to-bottom-ordered variant of the same tabs used in the mobile bottom bar (`TABS`) — the mobile bar centers "Dom" visually so its array order differs and isn't reused directly.

## Behavior

- Fixed-width (`260px`), full-height (`100dvh`), `position="sticky"` column on the left, with a `Koszt mieszkania` title/`House` icon header and one row per item.
- Active item (matched via `useLocation().pathname`, with `/` also matching `/pokoje/:roomId` like the bottom bar) gets a solid `primary.solid` background and `primary.contrast` text; inactive items are dimmed `primary.solid` text that brightens on hover.
- Uses `Link` from `react-router-dom` (via Chakra's `asChild`) for navigation, consistent with the rest of the app's routing conventions.
