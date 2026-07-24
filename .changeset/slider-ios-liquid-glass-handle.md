---
"@nannier/canvas": minor
---

Give the iOS Slider a real Liquid Glass handle. On iOS 26+ the slider handle
"transforms into liquid glass during interaction" (WWDC25); the kit now renders
that by routing the iOS thumb through the shared `GlassSurface` primitive, so
when glass is the active surface (the platform default on iOS 26) the knob is a
genuine Apple Liquid Glass puck that refracts the rail behind it and springs up
on press (Apple's scale/bounce feedback). Under a solid surface, Reduce
Transparency, or Increase Contrast it degrades to the previous opaque white
capsule, and the Android and web handles are unchanged.

`GlassSurface` also gains an optional `tint` prop that overrides the translucent
under-fill painted behind the material (default: the `popover` token), so a
small glass control such as the slider knob can read as a bright puck rather
than a popover-tinted panel.
