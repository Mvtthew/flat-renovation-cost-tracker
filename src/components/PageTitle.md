# PageTitle

Renders a page's heading, left-aligned in `xl` font size, with an icon to the
left of the title text. Used at the top of each tab's page component so every
page has a consistent title treatment.

## Props

- `children: string` — the title text (Polish, e.g. "Pokoje").
- `icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element` — a Gravity UI
  icon component, rendered in `primary.solid` to the left of the title. Pass
  the same icon used for that page's tab in `App.tsx` (e.g. `House` for
  `HomePage`) so the tab bar and page heading stay visually consistent.

## Use cases

- Top of `HomePage` (`House`), `TimelinePage` (`ChartLine`), `AddPage`
  (`CirclePlus`), `SettingsPage` (`Gear`).
