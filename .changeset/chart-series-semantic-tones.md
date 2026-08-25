---
"@nannier/canvas": minor
---

Charts: per-series semantic tones.

Minor justification (new public capability): `ChartSeries` accepts per-series
`success` and `destructive` tones so semantic multi-series charts colour by
meaning; unset series keep the chart-1..8 ramp. A sign-ins chart can now paint
"Granted" green and "Denied" red instead of handing both series the next two
positions in the categorical ramp, which said nothing about what either series
means.

The resolution lives in ONE place, `seriesColor(tokens, series, i, tone)` in
`charts.styles.ts`: a series' own tone first (success > destructive, the
chart-level precedence), then the chart-level tone for a single-series chart,
then the ramp position. It mirrors `rowFill`'s slot > tone > ramp resolution,
and every consumer of a `ChartSeries` colour routes through it: the shared
cartesian `colorOf` (LineChart, AreaChart, ComposedChart, RangeAreaChart), the
grouped Chart's bars, value flag, and legend, RadarChart's polygons, and
CandlestickChart's overlays. So the plot, the flag, and the legend cannot drift
apart.

A series that sets neither boolean renders byte-identically to before, and the
chart-LEVEL tone props stay single-series-only: their dev warning now points at
the per-series booleans, which are the sanctioned channel for that intent.
