# PlanItemFormPage

Full-page (not modal) add/edit form for a single planned-cost item — "plan a cost before you buy it." Registered in `App.tsx` at two routes: `/dodaj` (the "Dodaj" tab, add mode — no `itemId`) and `/pozycje/:itemId` (edit mode, reached e.g. from [RoomDetailPage](RoomDetailPage.md)'s "+ Pozycja planu" button, which links to `/dodaj?roomId=...` to preselect the room). `AppShell` in `App.tsx` hides the bottom tab bar whenever `location.pathname` starts with `/pozycje`; `/dodaj` keeps the tab bar since it's one of the 4 main tabs. Presence/absence of `itemId` (via `useParams`) selects edit vs. add mode, matching the [ShopFormPage](ShopFormPage.md)/[RoomFormPage](RoomFormPage.md) pattern.

In edit mode it fetches the item once with `get(ref(database, 'planItems/:itemId'))` on mount (fields disabled/dimmed via `opacity` while loading). It also subscribes with `onValue` to `settings/rooms` and `settings/shops` to populate the Room and Shop/supplier `NativeSelect` dropdowns, each sorted client-side by `order` (missing `order` treated as `0`) to match [RoomsSection](../components/RoomsSection.md)/[ShopsSection](../components/ShopsSection.md)'s drag-sortable order. Fields: `Pomieszczenie` (room, required, `NativeSelect`), `Nazwa` (name, required, `Input`), `Link` (url, `Input`), `Sklep / dostawca` (shop, `NativeSelect`), `Cena (za szt.)` + `Ilość` (price/amount, side-by-side `NumberInput`s), `Notatki` (notes, 3-row `Textarea`), `Data docelowa` (target date, native `Input type="date"`), `Odbiór` (pickup type, Chakra `SegmentGroup` — `Na miejscu` / `Dostawa`, reusing [ShopFormPage](ShopFormPage.md)'s `PickupType`), and — only rendered when pickup is `delivery` — `Koszt dostawy` (delivery cost) and `Szacowany czas dostawy` (delivery days). No photo/image field (intentionally omitted from the lofi mockup for now).

A close icon (Gravity UI `Xmark`) sits top-right of the heading and calls `navigate(-1)` (there's no fixed "back" destination since this page is reached from multiple places). "Dodaj do planu" / "Zapisz zmiany" does `push()` (add) or `set()` (edit) on `planItems` and navigates back on completion; in edit mode only, "Usuń pozycję" (red outline) confirms via `window.confirm` then `remove()`s the node and navigates back. Save is disabled until a room is selected and name is non-empty. On add, it first `get()`s the full `planItems` list, filters to the target room, and computes `Math.max(...order) + 1` for that room's items to set the new item's `order` field, so it lands at the end of [RoomDetailPage](RoomDetailPage.md)'s drag-sortable "Zaplanowane pozycje" list; edit mode never touches `order` (that's only ever rewritten by drag reordering in `RoomDetailPage`).

Exports the `PlanItem` type alongside the default component.

## Props

None — reads `itemId` from the route via `useParams` and an optional `roomId` query param (add mode only, to preselect the room) via `useSearchParams`.

## Use cases

- Planning a cost for a room before purchase, with optional link, shop, price/amount, notes, target date, and delivery details.
- Editing or deleting an existing planned item.
