# RoomsDonutChart

A donut chart built on [Chakra UI Charts](https://www.chakra-ui.com/docs/components/charts)
(`@chakra-ui/charts`, wrapping `recharts`'s `PieChart`/`Pie`/`Cell` via
`Chart.Root`/`useChart`). Renders one slice per segment (in practice, one per
room) plus a `Chart.RadialText` total centered in the ring. Each slice carries
a direct point label (room name only, via `Pie`'s `label` render prop)
instead of a separate legend — the value is available in the
`Chart.Tooltip` on hover/tap. Slices grow slightly on hover via `Pie`'s
`activeShape` (a `recharts` `Sector`). Slice corners are rounded 5px
(`Pie`'s `cornerRadius={5}`), matching [SpentVsPlannedBar](SpentVsPlannedBar.md)'s
bar radius.

`Chart.Root` does **not** provide `recharts` charts with a size — it's just a
sized `Box`. `PieChart`/`Pie` (recharts v3) read their pixel dimensions from a
`ResponsiveContainer` ancestor's context; omitting `ResponsiveContainer`
renders the chart at 0×0 (nothing visible), so it always wraps `PieChart`
here.

## Props

- `segments: DonutSegment[]` — `{ id, label, value }[]`, one per room. Segments
  with `value <= 0` are dropped. Segments are colored in **input order** from
  the app's 3 brand colors (`#5D3140`, `#CF4173`, `#F39399` — never reassigned
  by value/rank, so a room keeps its color across re-renders) — pass segments
  pre-sorted (e.g. by descending value) if a specific slice order matters.
  Beyond 3 segments, the rest are folded into an `#ecd3db` (`primary.100`)
  "Inne" slice rather than cycling the palette.
- `total: number` — sum shown in the chart's center; when `<= 0` (or there are
  no positive segments) the chart renders a "Brak zaplanowanych pozycji."
  empty state instead.
- `centerLabel: string` — small caption under the total (Polish, e.g.
  "zaplanowano").
- `formatValue: (value: number) => string` — formats both the center total and
  the tooltip/legend values (e.g. a `pl-PL` PLN `Intl.NumberFormat`).

## Use cases

- [PlanPage](../pages/PlanPage.md)'s "Zaplanowane koszty wg pomieszczeń"
  report — planned cost per room.
