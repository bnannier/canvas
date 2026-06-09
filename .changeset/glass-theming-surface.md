---
"@olympusoss/canvas": minor
---

Make glass a theming-level surface instead of a per-component prop

Glass used to be a per-component `glass` prop on Card AND a separate global toggle
that only restyled docs chrome, never the components themselves (the engine
resolves color utilities to literal token values, so a CSS-level glass mode could
not reach an RN component). Now glass is a real theming dimension, like the
light/dark scheme:

- `ThemeProvider` gains a `surface` prop (`"default" | "glass"`). When `"glass"`,
  the card and popover tokens are swapped to translucent, so every surface
  component reads as glass at once, on native and on web. On the web, drive it
  with `setSurface("glass")` and mirror the `<html data-surface>` attribute into
  the provider (see the docs `main.tsx` / `useDocsSurface` setup).

BREAKING (Card): the per-component `glass` prop is removed. A plain `<Card>` is
glass whenever the active surface is glass; use the theming-level surface instead
of opting individual cards into glass.
