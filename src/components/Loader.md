# Loader

Full-screen centered Chakra `Spinner`. Rendered by `App.tsx` while `useAuth` is still resolving the initial auth state or the post-sign-in Realtime Database access check (`loading` / `checkingAccess`), so the screen never goes blank between the static `#initial-loader` spinner in `index.html` and the real app/`LoginScreen` render.

## Props

None.

## Use cases

- Auth state resolving on app boot.
- Realtime Database access check running right after Google sign-in.
