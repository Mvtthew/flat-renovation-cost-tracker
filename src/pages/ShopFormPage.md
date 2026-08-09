# ShopFormPage

Full-page (not modal) add/edit form for a single shop/supplier, reached from [ShopsSection](../components/ShopsSection.md) via `react-router-dom`. Registered in `App.tsx` at two routes — `/ustawienia/sklepy/nowy` (add) and `/ustawienia/sklepy/:shopId` (edit) — both pointing at this same component, which reads `shopId` via `useParams`; its presence/absence selects edit vs. add mode. `AppShell` in `App.tsx` hides the bottom tab bar whenever `location.pathname` starts with `/ustawienia/sklepy`, so this page (like the mockup) renders without it.

In edit mode it fetches the shop once with `get(ref(database, 'settings/shops/:shopId'))` on mount (fields are disabled and dimmed via `opacity` while loading). Fields: a static (non-interactive) "logo / zdjęcie sklepu" placeholder box, `Nazwa sklepu` (name, `Input`), `Strona internetowa` (website, `Input`), `Domyślny sposób odbioru` (default pickup type, Chakra `SegmentGroup` — `Na miejscu` / `Dostawa`, i.e. `'in-store' | 'delivery'`), and `Notatki` (notes, `Textarea`). A back arrow (Gravity UI `ArrowLeft`) plus small "Ustawienia sklepu" breadcrumb text sit above the heading, both navigating back to `/ustawienia` via `useNavigate`. "Zapisz" (Save) does `set()` (edit) or `push()` (add) on `settings/shops` and navigates back on completion; in edit mode only, "Usuń sklep" (Delete shop, red outline) confirms via `window.confirm` then `remove()`s the node and navigates back.

Exports the `Shop` and `PickupType` types alongside the default component — [ShopsSection](../components/ShopsSection.md) imports them for its own list typing rather than duplicating the shape.

## Props

None — reads `shopId` from the route via `useParams`.

## Use cases

- Adding a new shop/supplier with optional website, default pickup type, and notes.
- Editing or deleting an existing shop.
