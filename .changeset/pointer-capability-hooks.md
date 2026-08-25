---
"@nannier/canvas": minor
---

Pointer-capability hooks: `usePointerCoarse()` and `useHoverCapable()`.

Minor justification (new public API): the input half of the desktop form
factor (macOS via the web skin, and desktop web). Native iOS/Android resolve
as touch-first constants; the web reads the standard `(pointer: coarse)` and
`(hover: hover)` media features live, so an iPad browser, a touch laptop, and
a mouse plugged into a tablet all resolve correctly. SSR and the pre-effect
first frame default desktop-first (fine pointer, hover-capable). Capability
only: no component behavior changes.
