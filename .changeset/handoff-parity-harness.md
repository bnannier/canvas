---
"@nannier/canvas": patch
---

Add a hand-off parity check, so the component layer is guarded the way the token layer already is.
`validate-tokens` compares every colour and metric against the design hand-off by value, but
nothing compared the COMPONENT surface, which is how `Field`, `DashboardGrid` and `ChartFrame` sat
absent from the kit without anything noticing.

`bun run check-parity` compares the kit's built type surface against a committed snapshot of the
hand-off's prop contracts and regenerates `HANDOFF-PARITY.md`. It deliberately does not demand
identical prop names: Canvas's semantic-boolean rule rejects the string-enum props the hand-off
uses freely, and React Native has no `onClick`. Every difference is adjudicated once in
`tools/handoff-parity/divergences.json` as either settled (renamed, boolean axis, web-only, not
offered) or an acknowledged open gap, and the check fails only on a difference recorded in
neither place, so a hand-off revision surfaces loudly instead of silently.

Resolving `extends` chains on the kit side is what makes the comparison meaningful:
`AreaChartProps extends CartesianSeriesProps`, so an own-members-only read reports every inherited
prop as missing and the result is noise rather than signal.

Current state: 75 hand-off components, 72 present; 719 props compared, 503 matching by name, 151
settled divergences, 65 tracked open gaps, 0 unclassified.

Patch, not minor: this adds no capability to the published package. It is repository tooling plus
a generated report.
