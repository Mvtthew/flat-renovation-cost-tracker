# HomePage

Dashboard page rendered by the "Home" tab in the bottom tab bar (see `src/App.tsx`). Follows the lofi mockup: an app title, three stat boxes (spent / planned / budget), a combined [SpentPlannedBudgetBar](../components/SpentPlannedBudgetBar.md), two count boxes, and a per-room "planned vs spent" breakdown.

## Data

Subscribes live (`onValue`, not `get()`) to four Realtime Database paths:

- `settings/overallBudget` — the total budget (see `SettingsPage`'s "Budżet całkowity" field).
- `settings/rooms` — the room list (see [RoomsSection](../components/RoomsSection.md)), read here as spending categories. Sorted client-side by each room's `order` field (missing `order` treated as `0`), matching the drag-sortable order set in [RoomsSection](../components/RoomsSection.md).
- `planItems` — all [PlanItemFormPage](PlanItemFormPage.md) entries. `planned` (overall and per-room) is the sum of each item's `price * amount` plus `deliveryCost` when `pickupType === 'delivery'`, not the room's own `budget` field.
- `invoices` — all [InvoiceFormPage](InvoiceFormPage.md) entries. `spent` (overall and per-room) is the sum of each invoice's `realCost` plus `deliveryCost` when `pickupType === 'delivery'`, matched to a room via `invoice.roomId`. The "faktury" stat box shows `invoices.length`.

The `RoomSummary` shape and `CategoryBar` component take these real per-room `planned`/`spent` values directly. `CategoryBar` renders a `compact` [SpentPlannedBudgetBar](../components/SpentPlannedBudgetBar.md) (a thin, legend-less, tooltip-less bar) under each room name.

Each `CategoryBar` row is a router `Link` to `/pokoje/:roomId`, opening [RoomDetailPage](RoomDetailPage.md) for that room.

## Props

None.

## Use cases

- At-a-glance view of total budget vs. planned vs. actually spent.
- Per-room breakdown of planned vs. actually spent, driven by linked invoices.
- Tapping a room row to drill into its [RoomDetailPage](RoomDetailPage.md).
