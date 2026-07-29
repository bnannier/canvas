---
"@nannier/canvas": minor
---

`Stats` gains a per-metric icon, header control and accent; `StackedList` gains a
per-row badge tone.

Minor rather than patch because both are new user-visible capabilities.

`StatItem` takes `icon` (a glyph naming what the metric counts), `actions` (a
control in the metric's header, a period selector or a filter) and one of
`chart1` through `chart8`, which accents the headline value from the same
categorical ramp the charts use, so a dashboard's tiles are tellable apart and a
metric can carry the identity of the series it summarises. The accent recolors
only the value: the delta keeps its own rise and decline semantics.

`StackedListItem` takes `success`, `error`, `warning`, `info` or `neutral`,
which tone its trailing `badge` as the kit's status pill. A service-health list
can now say healthy, degraded and down in colour instead of three identical grey
badges.

Backward compatible throughout. A metric with no icon, control or accent renders
exactly as before, and an untoned badge keeps its original `secondary` look.
Both new axes are mutually exclusive with a documented first-match precedence.
