# RoomFormPage

Full-page (not modal) add/edit form for a single room, reached from [RoomsSection](../components/RoomsSection.md) via `react-router-dom`. Registered in `App.tsx` at two routes — `/ustawienia/pomieszczenia/nowe` (add) and `/ustawienia/pomieszczenia/:roomId` (edit) — both pointing at this same component, which reads `roomId` via `useParams`; its presence/absence selects edit vs. add mode. `AppShell` in `App.tsx` hides the bottom tab bar whenever `location.pathname` starts with `/ustawienia/pomieszczenia`, so this page (like the mockup) renders without it.

In edit mode it fetches the room once with `get(ref(database, 'settings/rooms/:roomId'))` on mount (fields are disabled and dimmed via `opacity` while loading). Fields: a static (non-interactive) "ikona / zdjęcie pomieszczenia" placeholder box, `Nazwa pomieszczenia` (name, `Input`), and `Budżet pomieszczenia (opcjonalnie)` (optional room budget, Chakra `NumberInput` with a `zł` suffix, same pattern as the overall budget in [SettingsPage](SettingsPage.md)). No category field — rooms aren't split into "room" vs. "common" types. A back arrow (Gravity UI `ArrowLeft`) sits before the heading, navigating back to `/ustawienia` via `useNavigate`. "Zapisz" (Save) does `set()` (edit) or `push()` (add) on `settings/rooms` and navigates back on completion; in edit mode only, "Usuń pomieszczenie" (Delete room, red outline) confirms via `window.confirm` then `remove()`s the node and navigates back. On add, it first `get()`s the existing `settings/rooms` list to compute `Math.max(...order) + 1` and stores that as the new room's `order` field, so it lands at the end of [RoomsSection](../components/RoomsSection.md)'s drag-sortable list; edit mode never touches `order` (that's only ever rewritten by drag reordering in `RoomsSection`).

Exports the `Room` type alongside the default component — [RoomsSection](../components/RoomsSection.md) imports it for its own list typing rather than duplicating the shape.

## Props

None — reads `roomId` from the route via `useParams`.

## Use cases

- Adding a new room with an optional budget.
- Editing or deleting an existing room.
