---
"@nannier/canvas": minor
---

`StatItem` gains `steady`, which renders the delta muted rather than as a rise
or a decline.

A metric's second line is not always a change. It is often a qualifier: "last 30
days", "8 M2M / 4 user". Colouring those green reads as good news the caller is
not claiming. `steady` takes precedence over `down`, and omitting it leaves
today's rise/decline behaviour exactly as it was.
