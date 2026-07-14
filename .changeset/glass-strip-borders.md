---
"@bnannier/canvas": minor
---

Glass surfaces no longer draw a skin hairline border on top of the material.
Following Apple's Liquid Glass guidance to remove custom borders from navigation
surfaces, `splitSurfaceStyle` now strips border width/color/style under glass (radius
is kept): the edge comes from the material itself (native Liquid Glass on iOS 26) or
the specular rim (the frost on web, Android, and iOS &lt; 26). Solid mode and the
module-absent fallback are unchanged and keep their borders. The specular rim is now
shared across all frost platforms, including iOS &lt; 26, which previously had no edge.
