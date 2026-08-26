---
"@nannier-com/canvas": minor
---

GeoMap: `zoomable`, with bubbles that aggregate and split as you zoom.

Minor because it adds user-visible capability: a new `zoomable` boolean and the
`zoom` / `defaultZoom` / `onZoomChange` controlled trio, plus `onSelectPlaces`.
The wheel zooms about the pointer, two fingers pinch, a drag pans once zoomed,
and a zoom control pair plus the arrow keys give the same reach with no pointer
at all. Places too close together to draw separately merge into one bubble
carrying their summed count, and that bubble splits into its members as the map
is driven in.

Opt-in, so nothing changes for anyone who does not ask for it. Without
`zoomable` the camera is the world verbatim, there are no links, and the cut
degenerates to one bubble per point in input order, taking the identical code
path it always did.

`onSelect` keeps its exact meaning, a point index. Pressing a group reports its
largest member, which for a single place is today's value, and `onSelectPlaces`
carries every member alongside.

Aggregation cuts one minimum spanning tree, built per data set, at a threshold
that halves per zoom level. That makes each grouping a refinement of the one
above it, so a group can only split and no place can migrate: the anti-flicker
guarantee is structural rather than tuned. The threshold is exactly zero at the
deepest zoom, so any data separates fully.

Also fixes a pre-existing bug: React Native Web gives every Pressable
tabIndex 0 regardless of `accessible={false}`, so the map carried a second,
nameless tab stop that announced nothing.
