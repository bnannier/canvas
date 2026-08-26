---
"@nannier/canvas": patch
---

A `storageKey` DashboardGrid no longer breaks hydration: the saved layout is
adopted in the first commit after hydration instead of during it.

The stored order was read on the FIRST render, which on the web is the hydration
render. A user who had reordered their board therefore hydrated markup the server
never sent, and React does not patch that up: it discards the server tree and
rebuilds the whole subtree on the client. The first render now seeds from the
declared `defaultOrder` (or the `items` order), which is exactly what the server
shipped, and the saved layout takes over one render later.

The gate is the kit's existing hydration helper, lifted out of
`src/style/container.ts` into `src/style/use-hydrated.ts` so both callers share
one implementation: false for the server render and the hydration render, true
from the first commit on. It stays kit-internal, imported by path, and the window
fallback in `useContainerWidth` / `useContainerBreakpoint` behaves exactly as
before. `ThemeProvider`'s `ssrScheme` gives the colour axis the same contract.

Client-only apps are unchanged: with no hydration pass the first render already
reads storage.
