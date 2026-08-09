# LoginScreen

Full-screen gate shown by `App.tsx` whenever there is no authenticated + authorized user: just the app title "Koszt mieszkania" and a "Zaloguj się" (Sign in) button. No tab bar or page content renders behind it.

## Props

- `onSignIn: () => void` — called when the button is clicked; `App.tsx` wires this to `useAuth().signInWithGoogle`.

## Use cases

- Signed-out state.
- Signed-in but not authorized in the Realtime Database (briefly, before `useAuth` signs the user back out — see [useAuth](../hooks/useAuth.md)).
