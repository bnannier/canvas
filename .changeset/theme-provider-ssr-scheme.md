---
"@nannier/canvas": minor
---

ThemeProvider: new `ssrScheme` prop, the SSR/SSG hydration contract for scheme-aware colors.

Minor justification: new public API capability. Server-rendered apps (Next.js
static export and the like) can now tell the provider which scheme the server
resolved. The provider renders that scheme on the server and for the hydration
render, so the client's first render matches the server HTML exactly, then
applies the real `scheme` right after mount; the switch re-renders every
consumer, which writes the correct colors to the DOM. Without this, a client
whose scheme differs from the server default (stored preference, OS dark mode)
hits a React hydration attribute mismatch, and React keeps the server's inline
colors on any component that never re-renders again: kit components appear
stuck in the server's scheme after a refresh. Omitting the prop keeps the
existing single-pass behavior; client-only apps and native are unaffected.
