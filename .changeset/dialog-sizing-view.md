---
"@nannier/canvas": patch
---

Dialog and AlertDialog size their card with a plain view instead of `Entrance`. They never held the card (Entrance stayed ready there, a leftover of the removed spring), so nothing changes on screen, for touch or for assistive technology: the rendered tree is the same apart from the wrapper's redundant `pointer-events: auto` class, and the card's readiness for nested overlays passes through unchanged.
