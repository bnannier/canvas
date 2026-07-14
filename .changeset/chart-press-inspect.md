---
"@nannier/canvas": minor
---

Press-to-inspect across the chart family, on by default and controllable via
the `selected` / `defaultSelected` / `onSelect` trio. Pressing a category
(Chart vertical bars, LineChart, AreaChart), a slice (PieChart), or a point
(ScatterPlot, addressed as `{ series, point }`) toggles an inspection state:
cartesian charts draw a guide line, emphasized intersection dots, and an
in-plot value flag clamped to the plot bounds; bar charts dim the other
categories (grouped clusters also get the flag); a donut swaps its center
readout to the selected slice; scatter rings the point and flags its
coordinates. Every selection is mirrored to assistive tech via an
accessibility announcement. Keyboard arrow navigation of data points is a
planned follow-up; the full data remains available to screen readers through
each plot's accessible name.
