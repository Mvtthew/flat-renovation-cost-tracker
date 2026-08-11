# SwipeableRow

Wraps a list row's content and reveals a strip of `IconButton` actions to its right when the user swipes the row left, mimicking the native iOS/Android "swipe to reveal actions" pattern. Optionally also handles a swipe-right gesture as a distinct "select this row" action rather than revealing anything persistent.

## Props

- `actions: SwipeAction[]` — actions revealed on left-swipe, each `{ label, icon, onClick, colorPalette? }`. `label` is used as both the React key and the button's `aria-label`. Pass an empty array (or a conditionally-built array, e.g. via `...(condition ? [action] : [])`) to have zero actions — swiping left then does nothing.
- `children: ReactNode` — the row's normal (closed-state) content.
- `borderBottomWidth?` / `borderColor?` — forwarded to the outer container so list-row dividers (e.g. `SortableList`'s last-item check) render in the same place they would on a plain `HStack` row.
- `onSwipeRight?: () => void` — when provided, swiping the row right past half of a fixed 72px zone fires this callback and the row snaps back to closed (it does not stay pulled open the way left-swipe actions do). While dragging right, a `Check` icon fades in under the content (opacity tracks how far through the 72px zone the drag has gone) to preview the gesture. Omit this prop to disable right-swipe entirely (`actions`-only rows, e.g. the invoices list, are unaffected).
- `selected?: boolean` — when true, the foreground content gets a persistent `primary.subtle` background and a 4px `primary.solid` left border, independent of swipe state — the visual marker for "this row is selected," toggled by the consumer (typically from `onSwipeRight`).

## Behavior

Tracks pointer drags via `onPointerDown`/`onPointerMove`/`onPointerUp`/`onPointerCancel` on the foreground content. The first ~6px of movement decides direction: horizontal movement claims the gesture (calls `setPointerCapture`, `preventDefault`s further scrolling) and translates the content left (up to the total width of the revealed action buttons — each a fixed 44px square with 8px gaps and 8px trailing padding) or right (up to the 72px `onSwipeRight` zone, only if that prop is set); vertical movement is left alone so it falls through to page scroll or a parent drag handle (see below). Action buttons use `variant="subtle"` with a rounded (`borderRadius="lg"`) shape rather than filling the row edge-to-edge. On release: past the left-swipe halfway point, the row snaps fully open (stays revealed); past the right-swipe halfway point, `onSwipeRight` fires and the row snaps back to 0; otherwise it just snaps back to 0. Tapping the visible (closed-state) content while the row is open (left-swipe case only) closes it instead of firing whatever's underneath (`onClickCapture` intercepts and calls `preventDefault`/`stopPropagation`).

The foreground content is given `bg="bg"` (or `primary.subtle` when `selected`) so it visually covers the actions/select-indicator strip when closed.

## Interaction with `SortableList`

[SortableList](SortableList.md) attaches its dnd-kit drag listeners to the *entire* row element, activated via a distance/delay constraint. A `SwipeableRow` nested inside a `SortableList` item works because dnd-kit's touch activation has a delay+tolerance that self-cancels once movement exceeds the tolerance before the delay elapses — so a quick horizontal swipe doesn't accidentally start a reorder drag. This is a soft guarantee tuned for touch input, not a hard architectural separation; if reorder-vs-swipe conflicts show up in practice (most likely with mouse-based dragging), the fix is to give `SortableList` an explicit drag handle instead of making the whole row draggable.

## Use cases

- [RoomDetailPage](../pages/RoomDetailPage.md)'s planned-items list: swiping a plan item row left reveals "Pokaż notatki" (if the item has notes) and "Edytuj pozycję" actions, replacing what used to be always-visible icon buttons inline in the row. Swiping a row right toggles that item into/out of the page's bulk-tag-edit selection (`onSwipeRight` + `selected`). The invoices list on the same page still uses always-visible icon buttons and no selection — it hasn't been converted.
