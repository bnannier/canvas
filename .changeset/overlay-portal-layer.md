---
"@olympusoss/canvas": minor
---

feat: cross-platform overlay portal layer

Adds `OverlayProvider`, `Portal`, `useOverlayHost`, and `AnchoredOverlay`: a
pure-RN teleport (View/Pressable only, no Modal, no DOM, no position:fixed) that
lets a floating overlay render over the page and dismiss on outside-tap,
identically on iOS, Android, and web.

The dropdown now uses this layer, replacing its web-only dismiss backdrop (a
`Platform.OS === "web"` branch with a `position:"fixed"` style). Mount an
`<OverlayProvider>` at your app root to get the over-the-page anchoring and
outside-tap dismissal; with no provider mounted the dropdown falls back to an
inline menu positioned below its trigger (its pre-portal behavior), so existing
trees keep working.
