# useIsDesktop

Hook returning a reactive `boolean` for whether the viewport currently matches `(min-width: 768px)` — the same threshold as Chakra's `md` breakpoint, which is what `App.tsx`'s sidebar-vs-bottom-tab-bar switch and `src/theme.ts` responsive props key off. Backed by `window.matchMedia`, not a resize listener, so it only re-renders on an actual breakpoint crossing rather than every pixel of a resize.

## Returns

- `boolean` — `true` when the viewport is `768px` or wider.

## Use cases

- `App.tsx`'s `AppShell` uses it to decide whether `location.state.backgroundLocation` (see [modalRoute.ts](../lib/modalRoute.ts)) should be honored — on desktop, add/edit routes render as a `Dialog` over the current page; on mobile the same navigation just replaces the page normally, since `useIsDesktop()` being `false` means the background-location state is ignored.
- [SwipeableRow](../components/SwipeableRow.md) uses it to pick between a touch-swipe implementation (mobile) and a hover-revealed-actions implementation (desktop) — a mouse-first user shouldn't have to click-drag a row to reveal its actions.
