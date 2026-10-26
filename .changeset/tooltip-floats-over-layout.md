---
"@nannier/canvas": patch
---

Tooltip floats over the page instead of inserting itself into layout. Its bubble used to render in flow as a flex sibling of its trigger, so hovering a table row's action grew the cell and shifted the row. The bubble is now the kit's anchored card (AnchoredOverlay, pinned: no backdrop, not modal, no focus move), portaled into the nearest OverlayProvider, centered on its trigger at the chosen side, flipping and sliding to stay inside the visible band; with no provider it floats on an absolute anchor. Moving the pointer onto the bubble keeps it up (a 100 ms grace spans the gap). AnchoredOverlay's `centered` now also centers a content-sized card by the width it rendered at, and centers a beside card on its trigger's height. No API change.
