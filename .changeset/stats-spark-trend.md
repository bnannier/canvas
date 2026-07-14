---
"@nannier/canvas": minor
---

Stats items can carry a per-metric trend: pass `spark` (a `number[]`) on a
`StatItem` and the metric renders a Sparkline strip below its value, so the
"with sparkline" variant advertised in the docs is now a real capability rather
than a plain grouped stat.
