---
"@nannier/canvas": minor
---

ButtonGroup gains a `block` boolean, an orthogonal layout modifier matching the hand-off's ButtonGroup axis: the group stretches to the container width and the segments share the space equally (`flex: 1` gives each a zero flex-basis, so labels of different lengths still split evenly). It applies to the segmented and spaced kinds; the split and stepper kinds are fixed-width chrome (a chevron trigger, prev/next arrow cells), so they ignore it with a dev-only warning.

Minor justification: new public API (the `block` prop on ButtonGroup), not a fix to existing behavior.
