---
"@nannier/canvas": patch
---

Move `Sparkline` from atoms to charts. It is the only component in `atoms` that took a data series
(`values: number[]`); everything else there renders a single value or none. It now sits beside the
other bare marks it belongs with, `StackedBar` and `BarList`.

No API change: the export, its props and its rendering are untouched, and `/components/sparkline`
is still its docs URL. What moves is the source directory, the barrel it exports from, and its
grouping in the docs sidebar.

This is a deliberate divergence from the design hand-off, which files `Sparkline` under atoms. The
hand-off's own line puts anything needing a legend to be read (`StackedBar`, `Gauge`, `Heatmap`) in
charts and leaves `Sparkline` out because it shows shape rather than values. That line is
defensible, but plotting a series is the stronger signal, and grouping the kit's only
series-plotting atom away from every other series-plotting component made it hard to find. Note
that `check-parity` compares the prop surface only and does not compare tiers, so this divergence is
recorded here rather than in `HANDOFF-PARITY.md`.
