---
"@bnannier/canvas": minor
---

New `LineChart` and `AreaChart` components: categorical-x series charts with
single- and multi-series data (`labels` + `series`), a monotone `curved`
option that never overshoots the data, `dots` markers (LineChart), `stacked`
running-sum areas (AreaChart), automatic nice y-axis ticks and gridlines
(`hideGrid`/`hideAxes`), a shared series legend for multi-series charts
(`hideLegend`), `compact` density, tones for single series, and a
`formatValue` data formatter. Colors come from the `chart-1`..`chart-8`
tokens in fixed series order; the accessible name of the plot carries every
value, series-prefixed, per the kit's chart a11y contract. Built on the
kit's own react-native-svg frame: no charting library, no new dependencies.
