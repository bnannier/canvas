---
"@nannier-com/canvas": minor
---

`Stats` can draw a metric's composition where it has no trend, so a row of tiles
fills to one line.

New capability, three additions, all backward compatible:

- `StatItem.share` takes `StackedSegment[]` and draws them in the SAME slot as
  `spark`, as a proportional strip over a muted rail. Ignored when `spark` is
  set.
- `StatItem.sparkLabel` names what the trend strip plots. It still defaults to
  `"<label> trend"`, which is right whenever the strip is the value's own
  history; set it when the strip plots the supporting line instead, so a screen
  reader is not told the strip is something it is not.
- `StackedBar.track` paints the unfilled remainder as a muted rail, which is
  what lets a composition of nothing (a queue at zero, a metric at zero) read as
  a bar rather than as blank space. The all-zero dev warning now speaks only for
  the trackless case, since the track is how that state is drawn on purpose.

Why it was needed: cards in a Stats row stretch to the tallest sibling, so a row
where one metric carries a strip left every other tile with a band of blank space
under its text and read as an unfinished component rather than a deliberate one.
The kit offered no honest way to fill the rest, because a metric with no trend
had nothing to put in the slot. Most such metrics still decompose, and `share`
draws that decomposition, at the trend strip's reserved height so the row keeps
one card height. Found on the Ionize dashboard's four-metric row, where only
"Total identities" had a series to plot.
