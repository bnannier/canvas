---
"@olympusoss/canvas": minor
---

Glass surfaces now honor the OS accessibility settings, following Apple's Liquid
Glass guidance:

- Reduce Transparency renders every glass surface (overlays and bars) opaque
  instead of translucent.
- Increase Contrast renders glass opaque with a contrasting `foreground` border.
- The change is reactive: toggling either setting re-renders the theme, so on
  iOS 26 the surface flips live.

Adds two public hooks, `useReducedTransparency()` and `useIncreasedContrast()`,
and two additive `ThemeValue` fields (`reducedTransparency`, `increasedContrast`).

Also fixes the iOS &lt; 26 frost, which was missing the translucent `popover`
under-fill the web and Android frost already had, so it now reads as a
substantial material there too.
