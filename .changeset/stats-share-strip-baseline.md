---
"@nannier-com/canvas": patch
---

Stand a `Stats` composition strip on the trend strip's floor.

`share` reserved the trend strip's height and centred its bar in it, so in a row
that mixes the two the composition bar floated seven pixels above its
neighbours' baseline: a Sparkline's bars sit on the bottom of the band
(`alignItems: "flex-end"`). The strip is bottom-aligned now, so every tile in a
row shares one floor. Seen on the Ionize dashboard's four-metric row.
