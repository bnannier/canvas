---
"@nannier/canvas": patch
---

Fix the Android Material ripple bleeding past a control's rounded corners.

A bounded `android_ripple` is installed as the pressable's OWN background drawable, masked
to a rectangle. React Native implements `overflow:"hidden"` as a path-clip applied only in
`ViewGroup.dispatchDraw` (children only) and never enables `clipToOutline`, so a node can
never clip its own ripple: the rectangle bleeds past the rounded corners. Setting
`overflow:"hidden"` on the same node as the ripple (the kit's previous approach) does
nothing.

New `RippleClip` primitive: a rounded, `overflow:"hidden"` PARENT that wraps a
bounded-ripple pressable so the parent's child-clip rounds the ripple. It is Android-only
(no ripple to clip on iOS/web) and a transparent layout passthrough elsewhere, so the node
structure and layout are identical across platforms. `Button` now routes its ripple through
it; the same-node `rippleClip()` helper is deprecated in favour of the wrapper.
