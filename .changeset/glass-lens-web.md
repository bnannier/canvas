---
"@nannier/canvas": minor
---

Glass surface mode now renders as a real Liquid Glass LENS on Chromium web: an SVG displacement filter (refraction concentrated at the rim, the centre optically flat, with the blur + saturation built in) injected once per document and applied as the glass material's backdrop-filter through GlassSurface. It needs no optional module, sits above the expo-blur frost in the material ladder (the frost stays the tier for non-Chromium web, Android, and iOS < 26, and the translucent popover fill stays the last resort), matches the shipped CSS token `--glass-lens: url(#cds-glass-lens)`, and keeps the Reduce Transparency / Increase Contrast opaque rungs intact.

Minor justification: new user-visible capability of the published web glass material (the lens tier), not a fix to existing behavior.
