# RoomsSection

Renders the "Rooms" (`Pomieszczenia`) settings section, used by [SettingsPage](../pages/SettingsPage.md) above the shops section. Lists rooms persisted at `settings/rooms` in the Realtime Database (see [firebase](../lib/firebase.ts)) as `{ [pushId]: { name, budget?, order? } }` (see [RoomFormPage](../pages/RoomFormPage.md) for the `Room` type), subscribed live via `onValue` rather than a one-off `get()`. Until the first `onValue` callback fires, a centered `Spinner` is shown in place of the list, so the section doesn't flash an empty state while the initial fetch is in flight. Rooms are sorted client-side by `order` (missing `order` treated as `0`) before rendering.

Each row shows the room name and a `Pencil` icon button that is a router `Link` to `/ustawienia/pomieszczenia/:roomId`. Rows are rendered via [SortableList](SortableList.md), which makes the whole row draggable (no separate handle) — dragging to reorder writes the new `order` value for every room back to `settings/rooms/<id>/order` in one multi-path `update()`, and local state is updated optimistically so the list doesn't wait for the round-trip. A "+ Dodaj pomieszczenie" button (also a `Link`, via Chakra's `asChild`) navigates to `/ustawienia/pomieszczenia/nowe`. New rooms get `order` set to one past the current max so they land at the end of the list; `RoomFormPage` doesn't set `order` when editing an existing room. Both routes render [RoomFormPage](../pages/RoomFormPage.md) (registered in `App.tsx`), which is a full page rather than a dialog — see that doc for the add/edit/delete flow. Below the list, static helper text explains that rooms are categories for plan entries.

## Props

None.

## Use cases

- Adding a room (e.g. Kitchen, Living room, Bathroom, or a "Common" pseudo-room for shared costs) so costs/plan items can later be attributed to it.
- Navigating to a room's edit page via its pencil icon.
