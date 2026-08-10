# PlanPage

Rendered by the "Plan" tab in the bottom tab bar (see `src/App.tsx`, path `/plan`).
Shows renovation cost reports, each a centered plain-text title (no icon —
other than `PageTitle`'s) above its chart:

1. **"Zaplanowane koszty wg pomieszczeń"** — a donut chart
   ([RoomsDonutChart](../components/RoomsDonutChart.md)) of all planned costs
   (`planItems`, `firebase/database` path `planItems`), summarized per room
   (`settings/rooms`), with the total across all rooms formatted as PLN in the
   chart's center.
2. **"Plan vs wydatki z faktur"** — a segmented progress bar
   ([SpentVsPlannedBar](../components/SpentVsPlannedBar.md)) comparing total
   invoiced spend (`invoices`) against the same planned total from report 1.

Both reports share the same per-item cost formula as `HomePage`: plan items
use `price * amount` (+ `deliveryCost` when `pickupType === 'delivery'`);
invoices use `realCost` (+ `deliveryCost` when `pickupType === 'delivery'`).

Report sections sit in an outer `VStack` with `separator={<Separator />}`
(Chakra's divider-between-children prop, not a manually placed element), so
each report after the first automatically gets a `Separator` above it.

## Props

None.

## Use cases

- Reviewing how planned (not yet purchased) spend breaks down across rooms
  before committing to purchases.
- Checking whether actual invoiced spend is tracking under or over the
  planned total.
