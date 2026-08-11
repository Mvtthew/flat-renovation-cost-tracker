# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a Vite + React + TypeScript project. The original Vite starter boilerplate (App.tsx counter demo, default assets, PrimeReact/Tailwind experiments) has been removed. `src/App.tsx` renders a hand-rolled bottom tab bar (Chakra UI `Box`/`HStack`) with 4 tabs — Strona główna, Oś czasu, Dodaj, Ustawienia — each backed by a page component in `src/pages/` (mostly still placeholders). Routing is `react-router-dom` (see "Libraries"); the tab bar's `Link`s and `App.tsx`'s `<Routes>` are the source of truth for paths, not a separate route-constants file. No broader renovation-tracker feature set or state management/tests exist yet despite the repo name — [SettingsPage](src/pages/SettingsPage.md)'s budget and [ShopsSection](src/components/ShopsSection.md)/[ShopFormPage](src/pages/ShopFormPage.md) are the first real, Firebase-backed features.

## Language

All user-facing text in the UI (labels, headings, button text, placeholders, messages) must be in Polish, since the app's users are Polish speakers. Code, comments, identifiers, and this documentation stay in English — only strings rendered to the user need to be Polish.

## Colors

The app has a custom Chakra theme in `src/theme.ts` (`createSystem(defaultConfig, config)`, exported as `system` and passed to `ChakraProvider` in `src/main.tsx` — not `defaultSystem`). It defines a `primary` color palette (a dark plum/wine scale, 50–950, with `500` = `#5D3140` as the base/brand color) plus semantic tokens (`primary.solid`, `primary.fg`, `primary.muted`, etc., and `bg`/`border` overrides). Use `colorPalette="primary"` on Chakra components (Button, etc.) to pick it up, or reference tokens like `primary.solid`/`primary.500` directly (as [TabIcon](src/components/TabIcon.md) does for the active tab icon) rather than hardcoding the hex value. `#5D3140` is also the app's main text color: the `fg` semantic token (Chakra's default text-color token, normally black) is overridden in `src/theme.ts` to `{colors.primary.500}`, and `body { color: #5d3140 }` is set in `src/index.css` so the color applies before React mounts too (e.g. `index.html`'s static `#initial-loader`). Because `fg` now equals `primary.500`, don't combine `colorPalette="primary"` (bg = `primary.solid` = `primary.500`) with an explicit `color="fg"` on the same element — the text would match the background and disappear; let solid-variant components use their own contrast color (`primary.contrast` = white) instead.

## Fonts

The app's base font is **Rokkitt**, weight 500 (the font ships 100–900, but only 500 is imported). Includes a `latin-ext` subset covering Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż) — see "Language" above. Installed via `@fontsource/rokkitt` (`deno add npm:@fontsource/rokkitt`); `src/index.css` imports `@fontsource/rokkitt/500.css` and sets `font-family`/`font-weight` on `body`. `src/theme.ts` also sets the Chakra `fonts.body`/`fonts.heading` tokens to `'Rokkitt', serif` so Chakra Text/Heading components pick it up via the theme rather than only inheriting from `body`.

## Do not run the dev server

Never run `npm run dev` / `vite` / start a dev server — the user runs it themselves. Verify changes with `npm run build`, `npm run lint`, and/or type-checking instead.

## Libraries

- **UI components**: [Chakra UI](https://chakra-ui.com/) v3 via `@chakra-ui/react` + `@emotion/react`. Wrap the app in `ChakraProvider value={system}` (see `src/main.tsx`) — Chakra v3 dropped the old `ChakraProvider theme={...}` API in favor of a `system` object; `system` is a custom theme (`src/theme.ts`, built on top of `defaultConfig`) that adds the app's `primary` color palette — see "Colors" below.
- **Routing**: [react-router-dom](https://reactrouter.com/) v7, via `<BrowserRouter>` in `src/main.tsx` wrapping `<App>`. `App.tsx` defines the 5 tab paths (`/`, `/pokoje`, `/plan`, `/ustawienia`, `/dodaj`) plus nested full-page routes like `/ustawienia/sklepy/nowy` and `/ustawienia/sklepy/:shopId` ([ShopFormPage](src/pages/ShopFormPage.md)) that intentionally hide the bottom tab bar (checked via `useLocation().pathname` in `AppShell`) for focused add/edit flows reached from a settings list. Use `<Link>`/`useNavigate`/`useParams` for navigation; when putting a router `Link` inside a Chakra component, use `asChild` (e.g. `<Button asChild><Link to="...">...</Link></Button>`) rather than Chakra's `as={Link}` polymorphic prop — the latter doesn't type-check `to`.
- **CSS framework**: [Tailwind CSS](https://tailwindcss.com/) v4 via the `@tailwindcss/vite` plugin (registered in `vite.config.ts`) and `@import "tailwindcss";` at the top of `src/index.css` — no `tailwind.config.js`/PostCSS setup needed with the v4 Vite plugin. Used for layout utilities (e.g. `fixed inset-x-0 bottom-0`, `cursor-pointer`) alongside Chakra's own style props; prefer Chakra style props for component-level styling (spacing, color, typography) and Tailwind classes for one-off layout/utility needs Chakra doesn't cover as tersely.
- There is no separate general-purpose component library beyond Chakra UI (PrimeReact was installed and removed; Onsen UI was installed and removed).
- **Charts**: [Chakra UI Charts](https://www.chakra-ui.com/docs/components/charts) (`@chakra-ui/charts`), a thin Chakra-styled wrapper around [Recharts](https://recharts.org/) (`recharts`, a peer dep). Compose `Chart.Root`/`useChart` from `@chakra-ui/charts` with raw chart primitives imported from `recharts` (e.g. `PieChart`/`Pie`/`Cell`/`Label`/`Legend`/`Tooltip`) — see [RoomsDonutChart](src/components/RoomsDonutChart.md) for the donut-chart pattern (center total via `Chart.RadialText` inside a `Label`'s `content` render prop). `@chakra-ui/charts` also exports `BarSegment` (`Root`/`Content`/`Bar`/`Reference`/`Label`/`Value`/`Legend`/`Tooltip`), a plain Chakra-styled segmented bar with no `recharts`/`ResponsiveContainer` dependency — see [SpentVsPlannedBar](src/components/SpentVsPlannedBar.md) (2-segment: spent vs. planned, used on `PlanPage`) and [SpentPlannedBudgetBar](src/components/SpentPlannedBudgetBar.md) (3-segment: spent / planned / budget, used on `HomePage` and `RoomDetailPage`, including a `compact` list-row variant).

## Icons

Icons use [**Gravity UI Icons**](https://github.com/gravity-ui/icons) (`@gravity-ui/icons`), a package of React SVG icon components. The bottom tab bar in `src/App.tsx` is hand-rolled (not a component-library tab widget), so icons render directly as SVG components — no icon-font indirection needed. Each tab button renders a [TabIcon](src/components/TabIcon.md) with the icon component and label. Icons currently in use, by tab:

- Dom — `House`
- Plan — `ChartLine`
- Ustawienia — `Gear`
- Dodaj — `CirclePlus`

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
- [PageTitle](src/components/PageTitle.md)
- [LoginScreen](src/components/LoginScreen.md)
- [Loader](src/components/Loader.md)
- [ShopsSection](src/components/ShopsSection.md)
- [RoomsSection](src/components/RoomsSection.md)
- [RoomIconPicker](src/components/RoomIconPicker.md)
- [SortableList](src/components/SortableList.md)
- [SwipeableRow](src/components/SwipeableRow.md)
- [RoomsDonutChart](src/components/RoomsDonutChart.md)
- [AppDatePicker](src/components/AppDatePicker.md)
- [SpentVsPlannedBar](src/components/SpentVsPlannedBar.md)
- [SpentPlannedBudgetBar](src/components/SpentPlannedBudgetBar.md)
- [HomePage](src/pages/HomePage.md)
- [RoomDetailPage](src/pages/RoomDetailPage.md)
- [PlanPage](src/pages/PlanPage.md)
- [SettingsPage](src/pages/SettingsPage.md)
- [ShopFormPage](src/pages/ShopFormPage.md)
- [RoomFormPage](src/pages/RoomFormPage.md)
- [PlanItemFormPage](src/pages/PlanItemFormPage.md)
- [InvoiceFormPage](src/pages/InvoiceFormPage.md)
- [useAuth](src/hooks/useAuth.md) (hook, not a component, but documented the same way)

Don't read these `.md` files proactively or all at once — only open the specific one relevant to the component you're currently touching.

## Firebase

The project is backed by a Firebase project (`flat-renovation-cost-tracker`), configured in `src/lib/firebase.ts`. This is the single source of the Firebase config object and every initialized service instance — import from here rather than calling `initializeApp`/`getDatabase`/`getAuth` elsewhere.

- **App**: `app` — the initialized `FirebaseApp` (`firebase/app`).
- **Realtime Database** (not Firestore — this project uses the RTDB, not the Firestore document database): `database` — `getDatabase(app)` (`firebase/database`), pointed at `https://flat-renovation-cost-tracker-default-rtdb.europe-west1.firebasedatabase.app`. No data model/schema exists yet — reads/writes will need `ref`/`onValue`/`set`/`push` etc. from `firebase/database` once renovation-tracker features (rooms, costs, timeline entries) are built.
- **Authentication**: `auth` — `getAuth(app)` (`firebase/auth`), and `googleProvider` — a `GoogleAuthProvider` instance. Google is the only configured sign-in method. The [useAuth](src/hooks/useAuth.md) hook wraps `onAuthStateChanged`/`signInWithPopup`/`signOut` around these and is consumed by `App.tsx` (whole-app gating) and `SettingsPage` (sign-out UI).
  - Google sign-in must also be enabled as a provider in the Firebase console (Authentication → Sign-in method) and the app's domain(s) added under Authorized domains — this is dashboard config, not something set from code.
- **Whole-app auth gate**: the entire app is guarded. `App.tsx` renders [LoginScreen](src/components/LoginScreen.md) (just the "Koszt mieszkania" title + a "Zaloguj się" button) unless `useAuth` reports a signed-in *and* authorized user — only then does it render the real tab-bar app. "Authorized" is determined by Realtime Database Security Rules, not a separate allow-list node: `useAuth` attempts `get(ref(database))` (a root read) right after sign-in, and if the RTDB rules reject it, the user is immediately signed back out. So authorization lives entirely in the Realtime Database rules (configured externally, in the Firebase console) — there's no `/allowedUsers`-style path in app code to keep in sync. While `useAuth`'s `loading`/`checkingAccess` are unresolved, `App.tsx` renders [Loader](src/components/Loader.md) instead of the gate/app, so there's no blank screen between JS load and the auth decision — `index.html` also has a static CSS spinner (`#initial-loader`, inside `#root`) that's visible before React even mounts and gets replaced once React renders.
- The Firebase web config (`apiKey`, `authDomain`, etc.) in `src/lib/firebase.ts` is a public client identifier, not a secret — it's safe to have in source. Actual access control comes entirely from the Realtime Database Security Rules plus this sign-in/access-check/sign-out flow — there is no separate app-level allow-list.

## Architecture

- Build tool is Vite using **rolldown-vite** (`vite: ^8.2.0` resolves to the rolldown-powered build) with `@vitejs/plugin-react` for Fast Refresh.
- **React Compiler is enabled** via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.ts`. This auto-memoizes components, so avoid manually adding `useMemo`/`useCallback`/`React.memo` unless profiling shows the compiler isn't handling a specific case.
- TypeScript is configured in strict/bundler mode (`tsconfig.app.json`): `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all enforced, and `verbatimModuleSyntax` is on — type-only imports must use `import type`.
- Linting uses **oxlint** (not ESLint), configured in `.oxlintrc.json` with the `react`, `typescript`, and `oxc` plugins. Type-aware lint rules are not currently enabled (would require `oxlint-tsgolint`).
- `public/icons.svg` (the default Vite sprite) was removed along with the rest of the scaffold; there is currently no icon sprite convention — icons are Gravity UI SVG React components (see "Icons" above), not a sprite/font.
