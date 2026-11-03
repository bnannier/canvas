---
"@nannier/canvas": patch
---

Stats takes the v4 hand-off's layout and tile: by default the metrics sit in one bordered box with a hairline between each, and `framed` separates them into tiles 12px apart. The group lays out on the hand-off's auto-fit grid (a 180px floor for three or more metrics, 220px for one or two), so a narrow card stacks its metrics. Each tile has a 16px inset, a 13px label led by the accent's swatch and the icon, a small trend line beside the figure, a delta led by its direction arrow and, for `share`, a thin bar over a legend. Tappable metrics show a chevron and a hover wash on the web. The `compact` and `large` tiles are unchanged.
