# ShopsSection

Renders the "Shops / suppliers" (`Sklepy / dostawcy`) settings section, used by [SettingsPage](../pages/SettingsPage.md) directly below the overall budget input. Lists shops persisted at `settings/shops` in the Realtime Database (see [firebase](../lib/firebase.ts)) as `{ [pushId]: { name, website?, pickupType?, notes? } }` (see [ShopFormPage](../pages/ShopFormPage.md) for the `Shop`/`PickupType` types), subscribed live via `onValue` rather than a one-off `get()`. Until the first `onValue` callback fires, a centered `Spinner` is shown in place of the list, so the section doesn't flash an empty state while the initial fetch is in flight.

Each row shows a dashed-border placeholder box (Gravity UI `Picture` icon, standing in for a future shop logo/image), the shop name, and a `Pencil` icon button that is a router `Link` to `/ustawienia/sklepy/:shopId`. A "+ Dodaj sklep" button (also a `Link`, via Chakra's `asChild`) navigates to `/ustawienia/sklepy/nowy`. Both routes render [ShopFormPage](../pages/ShopFormPage.md) (registered in `App.tsx`), which is a full page rather than a dialog — see that doc for the add/edit/delete flow. Below the list, static helper text explains that shops listed here will appear as options in the (not yet built) plan-item form.

## Props

None.

## Use cases

- Adding a shop/supplier (e.g. IKEA, Leroy Merlin, a local hardware store, an online marketplace) so it can later be selected when logging a cost/plan item.
- Navigating to a shop's edit page via its pencil icon.
