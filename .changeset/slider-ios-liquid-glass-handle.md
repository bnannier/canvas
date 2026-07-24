---
"@nannier/canvas": minor
---

Give the iOS Slider a real Liquid Glass handle. On iOS 26+ the slider handle
"transforms into liquid glass during interaction" (WWDC25); the kit now renders
the iOS thumb through the shared `GlassSurface` primitive, so when glass is the
active surface (the platform default on iOS 26) the knob is a genuine Apple
Liquid Glass control. It stays a bright puck (matching the system handle) whose
Liquid Glass edge-lensing and specular show on physical iOS 26 hardware, and it
springs up on press (Apple's scale/bounce). The press grow is an animated
width/height resize, NOT a `transform: scale`, because a scale transform on the
GlassView's ancestor degrades the Liquid Glass material. Under a solid surface,
Reduce Transparency, or Increase Contrast it degrades to the previous opaque
white capsule, and the Android and web handles are unchanged.

Note: Apple's Liquid Glass only renders its blur/refraction on physical devices;
on the iOS Simulator the handle shows as a bright capsule with a subtle rim.

`GlassSurface` also gains an optional `tint` prop that overrides the translucent
under-fill painted behind the material (default: the `popover` token), so a
small glass control such as the slider knob can read as a bright puck rather
than a popover-tinted panel.
