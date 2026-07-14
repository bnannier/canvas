---
"@bnannier/canvas": minor
---

Trading charts, part 3. New `DepthChart`: the order-book view - cumulative
bid and ask step areas mirrored around the spread (bids in the success tone,
asks in destructive, translucent fills under solid step edges) on a numeric
price axis with nice ticks and both-axis gridlines. Levels are sorted and
accumulated internally (suffix sums for bids, prefix for asks); a crossed
book devWarns. The accessible name summarizes best bid/ask and per-side
level counts and totals.
