---
"@olympusoss/canvas": major
---

feat: Liquid Glass surface mode, glass-by-default on iOS 26

The `surface` theming mode now paints a real glass material on the functional
layer (overlays plus the bar/sidebar shells): Apple's native Liquid Glass via
`expo-glass-effect` on iOS 26+, a genuine `expo-blur` frost on web, Android, and
iOS < 26, and a translucent fill when those optional modules are absent. Content
surfaces (cards, lists, tables, charts) stay solid, following Apple's model.
Functional surfaces route through the new exported `GlassSurface` primitive.

On iOS 26+ the system makes Liquid Glass the default material for that layer, so
Canvas matches the OS: when `ThemeProvider`'s `surface` prop is omitted it now
resolves to a PLATFORM DEFAULT — glass on iOS 26+ (honoring Reduce Transparency),
solid everywhere else. The new exported `liquidGlassAvailable()` reports whether
that material is available. The iOS material is bound to the active scheme
(`colorScheme`) and uses the clear (almost-transparent) Liquid Glass variant.

`expo-blur` and `expo-glass-effect` are optional peer dependencies; without them
glass degrades gracefully to the translucent fill.

BREAKING: the force-solid `surface` value is renamed `"default"` → `"solid"`, so
an unset surface (the platform default) is distinct from an explicit flat
override. `Surface` is now `"solid" | "glass"`. Migrate any explicit
`surface="default"`, `setSurface("default")`, or `"default"` comparisons to
`"solid"`; an unset `surface` is unaffected and now yields the platform default.
