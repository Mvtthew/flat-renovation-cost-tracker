# TabIcon

Renders the icon + label content for a bottom tab bar button in `src/App.tsx`,
using a [Gravity UI Icons](https://github.com/gravity-ui/icons) SVG component.
Built as a small Chakra UI `VStack`/`Text` composition — no dependency on a
tab-bar component's own icon-rendering API, so it works with any icon
component that accepts `SVGProps<SVGSVGElement>`.

## Props

- `icon: (props: SVGProps<SVGSVGElement>) => JSX.Element` — a Gravity UI icon
  component, e.g. `House` from `@gravity-ui/icons`.
- `label: string` — the tab's label text.
- `active: boolean` — whether the owning tab is currently selected; toggles
  the icon/label color and label font weight.

## Use cases

- Bottom tab bar icons in `App.tsx` (Home, Rooms, Timeline, Add, Settings).
