---
"@nannier/canvas": patch
---

GridList: the virtualized path now collapses to one full-width column at phone
widths, matching the eager path; previously it kept 2-3 FlatList columns of
100%-wide tiles. The grid also resolves its responsive tile width once at the
parent instead of once per tile, so an N-tile grid carries one viewport
subscription instead of N.
