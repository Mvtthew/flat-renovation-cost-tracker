# SpentVsPlannedBar

A single segmented progress bar built on `BarSegment` from
[Chakra UI Charts](https://www.chakra-ui.com/docs/components/charts)
(`@chakra-ui/charts`) that compares actual spend (from invoices) against the
planned total (from plan items). Unlike [RoomsDonutChart](RoomsDonutChart.md),
`BarSegment` isn't backed by `recharts` — it's a plain Chakra-styled bar, so it
needs no `ResponsiveContainer`.

The bar is scaled to `max(planned, spent)` and split into two segments:
"Wydano" (spent, dark plum `#5D3140`) and, when spending hasn't caught up to
the plan, "Pozostało z planu" (the remaining headroom, `#CF4173` — the same
"zaplanowano" accent `HomePage` uses for its planned bar) — when spend has
overtaken the plan, the second segment simply disappears and the bar reads as
fully "Wydano". A `BarSegment.Legend` below shows each segment's formatted
value, sized down (`fontSize="xs"`, `lineHeight="1"`, `gap="3"` — passed
straight through as style-prop overrides since `BarSegmentLegendProps`
extends Chakra's `StackProps`) from its `sm`/looser default.

`BarSegmentBar`'s own segment corners aren't exposed as a prop (hardcoded to
Chakra's `l1` radius token internally, on each segment `Box`, a grandchild of
the wrapping `Box`), so each segment is force-rounded to 5px — matching
[RoomsDonutChart](RoomsDonutChart.md)'s slice `cornerRadius` — via a `css`
override (`'& > div > div': { borderRadius: '5px' }`) on a wrapping `Box`
rather than a prop, since `BarSegment` doesn't expose one.

## Props

- `planned: number` — total planned cost (e.g. sum of all plan items' costs).
- `spent: number` — total actual cost from invoices.
- `formatValue: (value: number) => string` — formats the legend and tooltip
  values (e.g. a `pl-PL` PLN `Intl.NumberFormat`).

When both `planned` and `spent` are `<= 0`, renders a "Brak danych do
porównania." empty state instead.

## Use cases

- [PlanPage](../pages/PlanPage.md)'s "Plan vs wydatki z faktur" report.
