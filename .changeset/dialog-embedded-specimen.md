---
"@nannier/canvas": minor
---

Adds the `embedded` boolean to Dialog, AlertDialog and Wizard (justification for the minor: a new public option, an open dialog shown as a non-modal specimen in a page). An embedded dialog keeps its look, its dialog or alertdialog role and its labelling, but it takes no focus when it opens, traps no Tab, returns no focus, sets no `aria-modal` or `accessibilityViewIsModal`, and does not cancel on Escape, native back or a backdrop press, so a page of open specimens loads at the top with the keyboard order intact. It is ignored with `trigger`, which always opens a live modal; a Wizard keeps presenting into the nearest OverlayProvider. The docs' open Dialog examples and the Overlays section's dialog, alert dialog and wizard specimens now use it.
