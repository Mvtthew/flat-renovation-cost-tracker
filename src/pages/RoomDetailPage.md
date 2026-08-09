# RoomDetailPage

Room detail page rendered at `/pokoje/:roomId`, reached by tapping a room row in [HomePage](HomePage.md)'s "Pomieszczenia" list. Follows the lofi "Room detail" mockup: a back arrow + room name header, a bordered stat box (spent / planned / budget + progress bar), and two list sections ("Zaplanowane pozycje" and "Faktury").

## Data

Subscribes live (`onValue`) to `settings/rooms/:roomId` (same path/shape as [RoomsSection](../components/RoomsSection.md) and [RoomFormPage](RoomFormPage.md)) to read the room's `name` and `budget`.

Also subscribes live (`onValue`) to the flat `planItems` path (see [PlanItemFormPage](PlanItemFormPage.md)) and filters client-side for items whose `roomId` matches this room — the RTDB has no per-room subcollection, so filtering happens in JS after the full `planItems` snapshot arrives. It also subscribes to `settings/shops` to resolve each item's `shopId` to a shop name. The "Zaplanowane pozycje" list renders each matching item: name; `price × amount` formatted as currency (`+ szt.` suffix when amount > 1); shop name with a `ShoppingBasket` icon (when `shopId` is set); delivery cost/days with `Trolley`/`Hourglass` icons and a `·` separator (when `pickupType` is `delivery` and either is set); and target date with a `Calendar` icon plus a human-readable relative offset in parentheses (e.g. "za 2 miesiące") computed by the local `formatRelativeTarget` helper via `Intl.RelativeTimeFormat('pl-PL')` (when `targetDate` is set). Each row's action column has, left to right: a `FileText` icon button (only when `notes` is set) that opens a Chakra `Dialog` modal showing the item's name and notes; a `Link`-icon button (only when `link` is set) that opens the item's link in a new tab; and a pencil edit link to `/pozycje/:itemId`. `planned` is the sum of `price × amount` across those items. "+ Pozycja planu" links to `/dodaj?roomId=...` to preselect this room in the add form.

There is still no invoice data model (per the project's "Project state" notes in `CLAUDE.md`):

- `spent` is hardcoded to `0` — `budget` reads from the room's `budget` field.
- The "Faktury" section always shows an empty state, and its "+ Dodaj fakturę" button is disabled — there's no invoice feature to add to yet.

Once invoice tracking is added, wire that section up to real data instead of the hardcoded empty state.

## Props

None (reads `roomId` from the route via `useParams`).

## Use cases

- Drilling into a single room from the home page to see its budget breakdown.
