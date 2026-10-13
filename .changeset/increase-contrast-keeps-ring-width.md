---
"@nannier/canvas": patch
---

Increase Contrast no longer thins a ring. The contrasting border a resting surface takes under Increase Contrast was a 1 px foreground hairline on every surface, so a 2 px Radio ring, the Android Switch's unchecked track and the Steps discs thinned to 1 px; it now keeps each side's own width where that is wider than the hairline, in foreground, and restates a side's own colour in foreground too. A border that shows a state keeps every colour its style names, so Android's current step keeps its 2 dp primary ring instead of losing it to the foreground hairline, a Material 3 underline field (the Android Input, Textarea, Select and Autocomplete) keeps its error, focus or open colour on its 2 dp active indicator, and a selected Card and a checked Radio card, which now hand their primary border to `paneStyle` as a state border in solid too, keep it instead of taking the foreground hairline.
