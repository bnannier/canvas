---
"@nannier/canvas": patch
---

Clear the react-native-web console deprecation warnings (so the web, iOS, and Android
dev consoles are all clean):

- `shadow*` style props: the `shadow()` helper (and a new `customShadow()` for one-off
  shades) are now platform-aware. They return the iOS `shadow*` props plus Android
  `elevation` on native, unchanged, and the equivalent cross-platform `boxShadow` string
  on web, where react-native-web deprecated `shadow*`. The four components that inlined
  their own iOS shadow (switch, slider, button-group, tabs) now route through
  `customShadow`, and the input-otp active ring uses a `boxShadow` spread on every
  platform. Shadows render identically as before on all three platforms.
- `pointerEvents`: moved from the deprecated prop form to `style.pointerEvents`
  throughout (the GlassSurface plumbing, inputs, slider, number-input, listbox, toast,
  carousel, filter-panel, and the portal outlet).
