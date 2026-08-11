# StatBox

A small bordered stat tile — a bold value, an optional icon next to it, and a
label underneath. Extracted from duplicate `StatBox` implementations
previously defined locally in both `HomePage` and `RoomDetailPage`, which had
drifted slightly (different default `borderWidth`/`py`, a `color` prop only
on `HomePage`'s version) before being unified here.

## Props

- `value: string` — the bold headline value (already formatted, e.g. via a
  currency `Intl.NumberFormat` or `String(count)`).
- `label: string` — the muted caption below the value.
- `variant?: 'outline' | 'solid' | 'plain'` (default `'outline'`) — `'solid'`
  fills the box with `color` (or `primary.solid`) and uses white text; the
  `'plain'` variant is accepted but currently renders the same as `'outline'`
  (no fill).
- `color?: string` — a Chakra color token/value used for the border (outline)
  or background (solid) and value/label text; falls back to `border` /
  `primary.solid` / `fg.muted` when omitted.
- `icon?: typeof House` — an optional Gravity UI icon rendered next to the
  value.
- `py?: number` (default `3`) — vertical padding.
- `borderWidth?: string` (default `'3px'`) — border thickness.

## Use cases

- `HomePage`'s summary row — "wydano" (solid), "pozycje", "faktury".
- [RoomDetailPage](../pages/RoomDetailPage.md)'s per-room summary row —
  "wydano" (solid), "budżet", "pozycje", "faktury".
