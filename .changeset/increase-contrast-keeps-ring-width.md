---
"@nannier/canvas": patch
---

Increase Contrast no longer thins a ring. The contrasting border a resting surface takes under Increase Contrast was a 1 px foreground hairline on every surface, so a 2 px Radio ring, the Android Switch's unchecked track and the Steps discs thinned to 1 px; it now keeps each side's own width where that is wider than the hairline, in foreground, and restates a side's own colour in foreground too. Android's current step keeps its 2 dp primary ring as a state border under Increase Contrast instead of losing it to the foreground hairline.
