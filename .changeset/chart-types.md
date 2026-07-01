---
"@olympusoss/canvas": minor
---

Add three chart types to the charts family so a stacked bar, a gauge, or a
heatmap is a real component instead of a hand-composed grid of Views:

- `StackedBar` — a proportional segmented bar with a labelled dot/percent legend.
- `Gauge` — a ring (muted track + a tone-colored fill arc via react-native-svg)
  with the value and an optional label centered inside.
- `Heatmap` — a wrapping grid of cells whose fill intensity encodes each value,
  with an optional less-to-more legend.

Like `Chart` they are a Shared platform treatment (identical on iOS, Android, and
the web).
