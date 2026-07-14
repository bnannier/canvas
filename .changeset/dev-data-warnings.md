---
"@bnannier/canvas": minor
---

Add a development-only `devWarn` helper (plus `resetDevWarnings` for tests) and wire
it into the data-driven charts, so degenerate inputs the kit otherwise resolves
silently now surface a one-time console warning during development: an empty
`Chart` / `Heatmap` / `Sparkline` series, an empty or all-zero `StackedBar`, and a
`Gauge` value outside 0–100 (still clamped). The warning is a no-op in production and
fires at most once per unique message, so a re-render never spams the log.
