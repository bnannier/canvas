---
"@bnannier/canvas": minor
---

Add `success` / `success-foreground` / `warning` / `warning-foreground` semantic
color tokens (scheme-correct in light and dark), and route the components that
were hand-picking light-only palette greens/ambers through them (`IconTile`
success tone, `EmptyState` positive, `Typography` positive/warning tones) so they
render correctly in dark mode. Also fix monospace text on iOS: a new
platform-aware `MONO_FONT` replaces `fontFamily: "monospace"` (which silently
fell back to San Francisco on iOS) with Menlo on iOS.
