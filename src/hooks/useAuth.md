# useAuth

Hook wrapping Firebase Authentication and gating access on the Realtime Database security rules. Internally tracks a single `status` state machine (`"loading" | "checkingAccess" | "authorized" | "signedOut"`) so consumers never see an inconsistent in-between frame (e.g. a signed-in user with the access check not yet flagged as running).

Subscribes to `onAuthStateChanged` on the shared `auth` instance from `src/lib/firebase.ts`. As soon as a user signs in, status moves straight to `"checkingAccess"` and it attempts a read of the database root (`get(ref(database))`) in the same tick. If the Realtime Database rules reject that read (the user isn't an authorized app user), the user is immediately signed out — status becomes `"signedOut"` again. If the read succeeds, status becomes `"authorized"`.

## Returns

- `user: User | null` — the current Firebase Auth user, or `null` if signed out.
- `ready: boolean` — `true` only once the user is signed in *and* the Realtime Database access check has passed. This is the single flag consumers should gate real content on.
- `signedOut: boolean` — `true` whenever there's no authorized session (not yet signed in, or the access check failed and the user was signed back out).
- `signInWithGoogle(): Promise<UserCredential>` — opens the Google sign-in popup (`signInWithPopup`).
- `signOutUser(): Promise<void>` — signs the current user out.

Note `!ready && !signedOut` is the loading/checking state (initial auth resolution, or the access check in flight) — render a loader for that case.

## Use cases

- `App.tsx` renders [LoginScreen](../components/LoginScreen.md) when `signedOut`, [Loader](../components/Loader.md) while neither `ready` nor `signedOut` is true, and the real app only when `ready` — so the whole app is gated behind an authenticated *and* Realtime-Database-authorized user, with no flash of the real app or a double loader in between.
- `SettingsPage` uses `user`/`signOutUser` to show the signed-in account and a sign-out button.
- Any future feature reading/writing Realtime Database data can assume, if it's mounted at all, that the current user already passed this access check.
