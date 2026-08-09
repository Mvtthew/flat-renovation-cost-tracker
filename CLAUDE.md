# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a Vite + React + TypeScript project. The original Vite starter boilerplate (App.tsx counter demo, default assets, PrimeReact/Tailwind experiments) has been removed. `src/App.tsx` renders a hand-rolled bottom tab bar (Chakra UI `Box`/`HStack`) with 5 tabs — Home, Rooms, Timeline, Add, Settings — each backed by a placeholder page component in `src/pages/`. No renovation-tracker features, real routing, state management, or tests exist yet despite the repo name.

## Do not run the dev server

Never run `npm run dev` / `vite` / start a dev server — the user runs it themselves. Verify changes with `npm run build`, `npm run lint`, and/or type-checking instead.

## Libraries

- **UI components**: [Chakra UI](https://chakra-ui.com/) v3 via `@chakra-ui/react` + `@emotion/react`. Wrap the app in `ChakraProvider value={defaultSystem}` (see `src/main.tsx`) — Chakra v3 dropped the old `ChakraProvider theme={...}` API in favor of a `system` object; `defaultSystem` is the built-in default theme/token set exported from `@chakra-ui/react`.
- **CSS framework**: [Tailwind CSS](https://tailwindcss.com/) v4 via the `@tailwindcss/vite` plugin (registered in `vite.config.ts`) and `@import "tailwindcss";` at the top of `src/index.css` — no `tailwind.config.js`/PostCSS setup needed with the v4 Vite plugin. Used for layout utilities (e.g. `fixed inset-x-0 bottom-0`, `cursor-pointer`) alongside Chakra's own style props; prefer Chakra style props for component-level styling (spacing, color, typography) and Tailwind classes for one-off layout/utility needs Chakra doesn't cover as tersely.
- There is no separate general-purpose component library beyond Chakra UI (PrimeReact was installed and removed; Onsen UI was installed and removed).

## Icons

Icons use [**Gravity UI Icons**](https://github.com/gravity-ui/icons) (`@gravity-ui/icons`), a package of React SVG icon components. The bottom tab bar in `src/App.tsx` is hand-rolled (not a component-library tab widget), so icons render directly as SVG components — no icon-font indirection needed. Each tab button renders a [TabIcon](src/components/TabIcon.md) with the icon component and label. Icons currently in use, by tab:

- Home — `House`
- Rooms — `LayoutCells`
- Timeline — `Clock`
- Add — `CirclePlus`
- Settings — `Gear`

To check whether an icon exists before using it, check for `<Name>.tsx`/`.d.ts` under `node_modules/.deno/@gravity-ui+icons@*/node_modules/@gravity-ui/icons/`, or browse the [icon list](https://github.com/gravity-ui/icons).

## Package manager

This project is managed with **Deno** (`deno.lock`, `node_modules/.deno` layout), not plain npm — `npm install` fails here (`Unsupported URL Type "workspace:"` errors from Deno's lockfile format). Use `deno add npm:<pkg>` / `deno remove npm:<pkg>` to manage dependencies, and `deno run -A npm:<bin>` (e.g. `deno run -A npm:vite build`) to run package binaries if the `npm run <script>` form doesn't work.

## Commands

- `npm run build` — type-check via `tsc -b` then build with Vite
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build locally (do not run unless asked — see "Do not run the dev server" above)

There is no test runner configured in `package.json`.

## Component documentation

For every new component, create a sibling `.md` file (e.g. `src/components/CostList.tsx` → `src/components/CostList.md`) describing what it does, its props, and its use cases. Link each one from here as it's added, so this file stays the index:

- [TabIcon](src/components/TabIcon.md)
- [HomePage](src/pages/HomePage.md)
- [RoomsPage](src/pages/RoomsPage.md)
- [TimelinePage](src/pages/TimelinePage.md)
- [AddPage](src/pages/AddPage.md)
- [SettingsPage](src/pages/SettingsPage.md)

Don't read these `.md` files proactively or all at once — only open the specific one relevant to the component you're currently touching.

## Architecture

- Build tool is Vite using **rolldown-vite** (`vite: ^8.2.0` resolves to the rolldown-powered build) with `@vitejs/plugin-react` for Fast Refresh.
- **React Compiler is enabled** via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.ts`. This auto-memoizes components, so avoid manually adding `useMemo`/`useCallback`/`React.memo` unless profiling shows the compiler isn't handling a specific case.
- TypeScript is configured in strict/bundler mode (`tsconfig.app.json`): `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all enforced, and `verbatimModuleSyntax` is on — type-only imports must use `import type`.
- Linting uses **oxlint** (not ESLint), configured in `.oxlintrc.json` with the `react`, `typescript`, and `oxc` plugins. Type-aware lint rules are not currently enabled (would require `oxlint-tsgolint`).
- `public/icons.svg` (the default Vite sprite) was removed along with the rest of the scaffold; there is currently no icon sprite convention — icons are Gravity UI SVG React components (see "Icons" above), not a sprite/font.
