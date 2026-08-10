# SortableList

Generic drag-and-drop reorderable list, built on [`@dnd-kit/core`](https://dndkit.com/) and `@dnd-kit/sortable`. The entire row (whatever `renderItem` returns) is the drag surface — there's no separate handle — and calls back with the new item order after a drag completes.

## Props

- `items: T[]` — the list to render, where `T extends { id: string }`. Order in the array is the display/drag order.
- `onReorder: (items: T[]) => void` — called with the full reordered array once a drag ends and the position actually changed. The caller is responsible for persisting the new order (e.g. writing an `order` field back to Firebase) and updating local state.
- `renderItem: (item: T) => ReactNode` — renders the content for one row (everything except the drag handle, which `SortableList` renders itself).

## Behavior

- Uses separate sensors per input type rather than the unified `PointerSensor`: `MouseSensor` (8px movement activation, so a click on the row — like the edit button — resolves as a click, not a drag) for mouse input, and `TouchSensor` (250ms long-press delay, 8px movement tolerance during the hold) for touch input. Also uses `KeyboardSensor` for accessibility.
- `TouchSensor` is used specifically (instead of relying on `PointerSensor` for touch too) because of how it decides scroll vs. drag: while a drag is still pending (before the delay elapses), a touchmove that exceeds the tolerance just cancels the pending drag *without* calling `preventDefault()`, so the browser is free to fall through to its native scroll. Only once the sensor has actually activated (delay elapsed, finger held within tolerance) does its move handler start calling `preventDefault()`, locking out scroll for the rest of that drag.
- That means rows must use `touch-action: pan-y`, not `none` — `touch-action` is a browser-level hint fixed for the whole gesture at touch-start (JS can't override it mid-gesture, e.g. by flipping it once React's `isDragging` state changes), and `none` would block native scrolling unconditionally from the first touch, regardless of the sensor's delay/tolerance logic. `pan-y` keeps the page scrollable for a quick swipe while still letting the sensor's `preventDefault()` win once a drag genuinely activates.
- Dragging is vertical-list only (`verticalListSortingStrategy`).

## Use cases

Used by [RoomsSection](RoomsSection.md) and [ShopsSection](ShopsSection.md) in the settings page to let the user reorder rooms and shops/suppliers, and by [RoomDetailPage](../pages/RoomDetailPage.md) to let the user reorder a room's planned items and invoices. All persist the new order to Firebase Realtime Database as an `order` field on each record (via a single multi-path `update()` call keyed by `<path>/<id>/order`), and sort by that field (falling back to `0`) when loading. For plan items and invoices, `order` is scoped per room (only items already filtered down to one room are ever compared/reordered against each other), not global across the whole `planItems`/`invoices` path.
