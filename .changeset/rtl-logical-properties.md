---
"@nannier/canvas": minor
---

RTL support: the kit now uses logical `start`/`end` style properties instead of
physical `left`/`right` (margins, padding, positioning offsets, and border
radii) across every component, so right-to-left locales get a correctly mirrored
UI on web and on native. `GlassSurface` reads both physical and logical corner
radii so its specular rim hugs the surface either way.
