# SettingsPage

Page rendered by the "Settings" tab in the bottom tab bar (see `src/App.tsx`). Only reachable once `App.tsx` has confirmed the user is authenticated and authorized (see [useAuth](../hooks/useAuth.md)), so it assumes a signed-in user and shows their avatar/name plus a "Sign out" button.

Below the account row and a divider, it has an "Overall budget" (`Budżet całkowity`) settings section: a Chakra `NumberInput` (with a "PLN" suffix via `InputGroup`'s `endElement`) bound to the `settings/overallBudget` path in the Realtime Database (see [firebase](../lib/firebase.ts)). On mount it fetches the current value with `get()`; typing updates local input state only, and the value is persisted with `set()` on blur/Enter (`NumberInput.Root`'s `onValueCommit`), not on every keystroke. The input is disabled while the initial fetch or a save is in flight.

## Props

None.

## Use cases

- Signing out of the current Google account.
- Viewing/editing the overall renovation budget (persisted to Firebase RTDB).
- Future: more app-level settings (currency, etc).
