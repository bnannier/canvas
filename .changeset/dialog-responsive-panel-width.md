---
"@nannier/canvas": patch
---

Dialog and AlertDialog panels now shrink to fit a narrow screen instead of
overflowing. Their outer wrapper fills the available width (and the backdrop can
shrink below the card's content width), so the panel's `maxWidth: "100%"` caps it
to the container: on a phone the panel fits the viewport rather than running off
the right edge, while on desktop it still renders at its per-size width, centered.
The optional trigger button keeps its natural width.
