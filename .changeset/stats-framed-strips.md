---
"@nannier-com/canvas": minor
---

`Stats` can frame every metric's strip, so a row of them scans evenly.

Without a frame each strip draws only its marks, and in a row that is not a
neutral choice: a metric whose series is quiet draws a few faint marks beside a
metric whose bar is full, so the densities run from blank to solid with nothing
tying them together. The eye lands on the fullest tile rather than scanning the
row, and the quiet tiles read as charts that failed to load rather than as
charts sitting at zero.

- `Stats.framed` puts every strip on the muted track, in one bounded band: the
  frame is the same whatever the data, so the fill is the only thing that
  varies, and a flat series reads as a chart at zero.
- `Sparkline.track` paints the plot area with the muted track. Use it where
  strips sit side by side; a lone sparkline in running text is usually better
  without.
- `StackedBar.tall` takes the 24 band a Sparkline plots in, with the chart bar
  radius rather than the pill, so a composition and a trend draw as one family.
- `StackedBar.subtle` washes the segments to the density a Sparkline gives its
  own marks, for a bar that supports a headline rather than being one. `Stats`
  now draws a tile's `share` this way, framed or not: inside a tile the strip
  supports the value rather than being it.

All additive, and every default is unchanged. Found on the Ionize dashboard's
four-metric row, where the solid composition bar outweighed its three quiet
neighbours.
