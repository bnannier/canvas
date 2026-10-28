---
"@nannier/canvas": minor
---

Minor, for two new public options:

- `plain` on Chart, LineChart, AreaChart, ComposedChart, RangeAreaChart, Histogram,
  BoxPlot, ScatterPlot, WaterfallChart, Treemap, FunnelChart, BulletChart, RadarChart,
  DepthChart, CandlestickChart and GeoMap strips the chart's own card surface so it can sit
  inside a card that already supplies one, as BarList, ServiceHealthList, MetricBreakdown
  and Stats already allow. It is the v4 hand-off's chart frame `plain` mode.
- `apart` (32) on Row, Column and Grid: the gap between the side-by-side panels of one
  composition, the hand-off's widest grid gap. It ranks under `chapter` and over `page`.
