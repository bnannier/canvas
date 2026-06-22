---
"@olympusoss/canvas": minor
---

Add a `TabBar` organism: the bottom app-navigation bar (iOS HIG tab bar / Material 3
navigation bar), a row of equal-width icon-over-label destinations with one active. It
renders through `GlassSurface` (real Liquid Glass on iOS 26, frost on web/Android in glass
mode, solid otherwise) and ships web/iOS/Android skins (Light treatment: iOS ~49pt with a top
hairline and SF labels; Android a taller M3 navigation bar with a brand ripple; web mirrors
the iOS look). Fills the previously-missing bottom-nav slot, distinct from the top `Navbar`
and the in-page `Tabs`.
