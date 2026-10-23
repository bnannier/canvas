---
"@nannier/canvas": minor
---

Remove every deprecated alias and every helper the package published by accident: 131 names leave the public entry, among them AnchoredOverlay, Entrance, GlassSurface, GlassPane, FloatingLabel, Portal, LoopView, RippleClip, the overlay, focus, ripple and touch-target hooks, `shadow` and `customShadow`, the Riskora type ladder (`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`), `HUE_WASH`, `brandColors`, `tabularNums`, and the `StyleSheet` and `useWindowDimensions` pass-throughs. `useOverlayHost` and its `OverlayHost` type stay public, documented with OverlayProvider. The docs' /foundation reference page, which listed the deprecated names, is gone.

Minor by the owner's decision of 2026-10-23: nothing consumes these names, so their removal is shipped without a major. Use the components that render this machinery themselves (Popover, Dialog, Card, Typography's `tabular`, Card's appearances) and React Native's own `StyleSheet` and `useWindowDimensions`. The deprecated `styles/*` custom properties are unchanged.
