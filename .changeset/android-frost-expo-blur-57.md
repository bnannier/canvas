---
"@nannier/canvas": patch
---

Adapt the frost to expo-blur 57's new Android blur API. expo-blur 57 blurs an
explicitly designated `BlurTargetView` (named by ref) instead of whatever
renders behind the `BlurView`, and it logs a deprecation warning for the legacy
`experimentalBlurMethod` prop plus a fallback warning whenever the dimezis
method is named without a target. `GlassSurface` now detects the installed API
generation (by the `BlurTargetView` export) and passes `blurMethod` on 57+,
keeping the legacy prop on older releases, which silences both warnings. On
Android under expo-blur 57 the frost renders its translucent fill without a
real blur for now: pointing a frost surface at an ancestor target crashes
Android outright (a render-node cycle in libhwui), so blur needs per-surface
sibling targets, and `GlassSurface` already consumes the new
`GlassBlurTargetContext` so a future provider only has to publish one. Web
(backdrop-filter) and iOS (native material) are unchanged, as are consumers on
expo-blur 56 and consumers without the optional peer.
