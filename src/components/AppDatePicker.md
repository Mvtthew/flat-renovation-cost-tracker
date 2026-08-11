# AppDatePicker

Wraps Chakra UI v3's `DatePicker` (built on Ark UI + `@internationalized/date`)
into a single-date field that speaks the same "ISO string" value type
(`YYYY-MM-DD`, matching `<input type="date">`) that the rest of the app's
forms already use with plain `useState<string>`. Renders a text `DatePicker.Input`
plus a calendar-icon trigger button that opens a day/month/year picker
(`DatePicker.Content`, portaled).

## Props

- `value: string` — selected date as an ISO string (`""` for no selection).
- `onValueChange: (value: string) => void` — called with the new ISO string
  (or `""` if cleared) whenever the user picks a date.
- `disabled?: boolean`
- `placeholder?: string`

Internally converts `value` to a `DateValue` via `parseDate` (from
`@chakra-ui/react`, re-exported from Ark UI) on the way in, and reads
`details.valueAsString[0]` (already ISO-formatted) on the way out — no manual
date-library formatting needed. `locale="pl-PL"` is hardcoded per the app's
Polish-only UI (see "Language" in `CLAUDE.md`).

## Use cases

- `InvoiceFormPage`'s "Data" field.
- `PlanItemFormPage`'s "Data docelowa" field.

Replaces the native `<Input type="date">` previously used in both forms, for
visual/interaction consistency with the rest of the app's Chakra-based form
controls (see also the `Select` conversion of former `NativeSelect` fields in
the same pages).
