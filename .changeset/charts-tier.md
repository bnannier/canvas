---
"@olympusoss/canvas": minor
---

Charts are now their own tier. The kit source moves from
`src/organisms/charts` to a top-level `src/charts/` with one directory per
chart component (Chart, LineChart, AreaChart, PieChart, ScatterPlot,
CandlestickChart, DepthChart, StackedBar, Gauge, Heatmap) sharing the
frame/math/inspect core in `src/charts/shared/`. Every component keeps its
existing name and export from the package root, so no consumer import
changes. The docs gain a "Charts" category at the same level as Atoms,
Molecules, and Organisms (sidebar group after Organisms, its own catalog
section with preview tiles, and one page per chart type); the old combined
`/components/charts` page redirects to `/components/chart`.
