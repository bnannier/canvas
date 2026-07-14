---
"@bnannier/canvas": minor
---

New `PieChart` component: proportional composition as arc slices with the
`chart-1`..`chart-8` token colors in fixed order, a card-surface hairline
separating adjacent fills, the StackedBar-style legend with per-slice
percentages (`hideLegend` hoists the data-bearing img name to the root), a
`donut` boolean that centers the compact total and label like Gauge, and
`compact` sizing. Warns past 8 slices (fold the tail into "Other").
