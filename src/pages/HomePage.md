# HomePage

Dashboard page rendered by the "Home" tab in the bottom tab bar (see `src/App.tsx`). Follows the lofi mockup: an app title, three stat boxes (spent / planned / budget), a combined progress bar, two count boxes, and a per-room "planned vs spent" breakdown.

## Data

Subscribes live (`onValue`, not `get()`) to two Realtime Database paths, both already used by [SettingsPage](SettingsPage.md):

- `settings/overallBudget` — the total budget (see `SettingsPage`'s "Budżet całkowity" field).
- `settings/rooms` — the room list (see [RoomsSection](../components/RoomsSection.md)), read here as spending categories. Each room's own `budget` field is treated as that room's "planned" amount.

There is no cost/invoice line-item feature yet (per the project's "Project state" notes in `CLAUDE.md`), so:

- `planned` is derived as the sum of all room budgets.
- `spent` is hardcoded to `0` everywhere (per-room and overall) until an invoices/plan-items data model exists.
- The "faktury" (invoices) stat box is hardcoded to `0`; the box next to it shows the count of rooms instead of a "planned items" count, since no such entity exists.

Once invoice/plan-item tracking is added, wire `spent` (and the invoices count) to that data instead of the hardcoded `0`s — the `RoomSummary` shape and `CategoryBar` component are already set up to take a real `spent` value per room.

Each `CategoryBar` row is a router `Link` to `/pokoje/:roomId`, opening [RoomDetailPage](RoomDetailPage.md) for that room.

## Props

None.

## Use cases

- At-a-glance view of total budget vs. planned vs. actually spent.
- Per-room breakdown of planned spend (until per-room "spent" tracking exists, bars will show 0% filled).
- Tapping a room row to drill into its [RoomDetailPage](RoomDetailPage.md).
