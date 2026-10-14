---
"@nannier/canvas": minor
---

A page's own blur plane on Android: `useGlassBlurPlane` makes a plane, `GlassBlurPlane` makes the view it wraps (a page backdrop) the captured plane through `@nannier/canvas-blur`, and `GlassBlurScope` offers it to the glass surfaces inside it, which frost it where they would otherwise paint their solid skin (an in-page surface has no safe plane of its own). On iOS and the web, and on Android without the integration, both render their children only.

Minor, justified: new public API (a hook and two components) for a capability the kit did not offer, a safe in-page blur plane on Android.

Also fixed: a glass surface's box keeps its native view while it paints a material, so on iOS and Android the material (at zIndex -1 inside the box) can no longer be hoisted by view flattening beneath the box's earlier siblings, where it disappeared.
