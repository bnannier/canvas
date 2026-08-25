---
"@nannier/canvas": minor
---

Responsive core: shared viewport breakpoint store and form-factor tier.

Minor justification (new public API): `useBreakpoint()` (the active viewport
bucket), `FormFactor` / `formFactor(width)` / `useFormFactor()` (the semantic
phone / tablet / desktop tier over the breakpoints, where desktop covers macOS
and desktop web), and a `ssrBreakpoint` prop on `ThemeProvider` (the
`ssrScheme` contract applied to the viewport axis).

Behavior fixes riding along:

- `responsive()` / `useResponsive()` now resolve a non-positive width (SSR and
  the pre-layout first frame, where react-native-web reports 0) to `base`, the
  desktop variant. Previously width 0 matched the smallest declared breakpoint,
  so servers and first frames rendered the PHONE branch of every consumer on
  desktop. The kit is desktop-first; unknown viewport now means desktop.
- All viewport hooks share ONE Dimensions subscription and re-render consumers
  only when the active breakpoint bucket changes, not on every resize event.
- `breakpoints` is now typed `Record<BreakpointKey, number>`, so indexing it
  with an arbitrary string is a compile-time error instead of a silent
  `undefined`.
