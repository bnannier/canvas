---
"@nannier/canvas": minor
---

`Chart` gains grouped multi-series bars: pass `labels` + `series` (the shared
`ChartSeries` shape) to render clustered columns per category, colored by the
`chart-1`..`chart-8` tokens in fixed series order, with a built-in legend
(`hideLegend` to suppress) and per-category accessible items that announce
every series' value. The single-series `data` shape is unchanged and `data`
callers are unaffected; `ChartSeries` now lives in the Chart family's shared
types.
