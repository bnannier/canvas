---
"@nannier/canvas": minor
---

Chart: stacked grouped columns.

Minor justification (new public capability): Chart grouped mode gains stacked
columns (categories by series accumulating per column) for composition-over-time
bars. Passing `stacked` alongside `labels` + `series` turns each category's
cluster into ONE column whose segments accumulate, so "token issuance by client,
split by grant type" reads as each client's total and its composition instead of
four bars to compare by eye. AreaChart already had `stacked`; this is the same
idiom for bars.

The axis follows the per-category TOTALS rather than the largest single value,
since the column now encodes the sum. Segments abut with no gap (StackedBar's
convention) and sit bottom-series-first (the stacked AreaChart's band order);
only the topmost non-empty segment takes the bar's rounded cap, an empty segment
paints nothing rather than the 2px minimum a clustered bar keeps, a negative
value counts as 0, and the running sum is clamped to the plot so a `max` below
the true total cannot overflow the column. The legend, the press/scrub value
flag, and the dimming all keep working, and a stacked column's accessible item
names the category total after its segments (the column height is the total's
only visual channel).

`stacked` is grouped-mode only: passing it to a single-series `data` chart
devWarns and renders unchanged. Omitting it renders the existing clustered
columns byte-identically.
