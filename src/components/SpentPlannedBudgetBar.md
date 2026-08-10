# SpentPlannedBudgetBar

A single segmented progress bar, built on `BarSegment` from
[Chakra UI Charts](https://www.chakra-ui.com/docs/components/charts)
(`@chakra-ui/charts`), that visualizes spent vs. planned vs. budget as one
3-part breakdown rather than the three separately-colored overlaid bars
`HomePage` and `RoomDetailPage` used before. Like
[SpentVsPlannedBar](SpentVsPlannedBar.md), `BarSegment` isn't backed by
`recharts`, so it needs no `ResponsiveContainer`.

The bar is split into up to three segments, each only rendered when its
value is `> 0`:

1. **"Wydano"** (`spent`, dark plum `#5D3140`).
2. **"Do wydania wg planu"** (`max(planned - spent, 0)`, `#CF4173` — the
   "zaplanowano" accent) — the part of the plan not yet spent.
3. **"Pozostały budżet"** (`max(budget - max(spent, planned), 0)`, `#F39399`)
   — budget headroom beyond both spent and planned.

If spending (or planning) has overtaken the budget, segment 3 disappears; if
spending has overtaken planning, segment 2 disappears too and the bar reads
as fully "Wydano" — same overflow behavior as
[SpentVsPlannedBar](SpentVsPlannedBar.md). Segment corners are force-rounded
to 5px via the same `css` override on a wrapping `Box` (`BarSegment` doesn't
expose a radius prop). In the non-`compact` case, a `BarSegment.Legend` below
shows each rendered segment, sized down (`fontSize="xs"`, `lineHeight="0"`,
`gap="3"`) from its default; its formatted value is opt-in per instance via
`showLegendValue`.

## Props

- `spent: number` — total actual cost (e.g. from invoices).
- `planned: number` — total planned cost (e.g. from plan items).
- `budget: number` — the budget ceiling being tracked against.
- `formatValue: (value: number) => string` — formats the legend and tooltip
  values (e.g. a `pl-PL` PLN `Intl.NumberFormat`).
- `compact?: boolean` (default `false`) — slim rendering for list rows: a
  thinner bar (`barSize="4"` vs the default `"8"`), no `BarSegment.Legend`,
  and no hover tooltip (so it doesn't fight a row's own click target). When
  compact and all three values are `<= 0`, renders nothing (`null`) instead
  of the "Brak danych do porównania." text, since a list row already shows
  the room name with zeroed amounts next to it.
- `showLegendValue?: boolean` (default `true`) — whether the legend shows
  each segment's formatted value next to its swatch/name. Ignored when
  `compact` (no legend renders at all). `HomePage`'s and `RoomDetailPage`'s
  main summary bars pass `false` — the same totals are already shown in the
  stat boxes above the bar, so repeating them in the legend was redundant.

When `spent`, `planned`, and `budget` are all `<= 0` and `compact` is
`false`, renders a "Brak danych do porównania." empty state instead.

## Use cases

- `HomePage`'s "Podsumowanie" section — overall spent/planned/budget.
- `HomePage`'s `CategoryBar` — one `compact` bar per room list row (in place
  of the three-color overlaid bar it used before).
- [RoomDetailPage](../pages/RoomDetailPage.md)'s per-room spent/planned/budget
  breakdown.
