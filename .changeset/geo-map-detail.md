---
"@nannier-com/canvas": patch
---

GeoMap: sharper coastlines and country borders.

The world data now comes from Natural Earth 1:50m instead of 1:110m, and the
generator emits a second path holding the mesh of boundaries that two countries
share (coastlines excluded, since the land path already draws those). The viewBox
widens from 1000 to 2000 units, so the geometry stays crisp when the map is drawn
wider than 1000px, which it is wherever a caller passes `width: "100%"`.

Land now carries a coastline stroke and borders a fainter one, both in the muted
foreground token, so the silhouette reads against the card surface in both schemes
instead of sitting a couple of steps away from it on the ramp.

No API change: every prop keeps its meaning, so no call site needs touching. The
bubble radius constants doubled because they are expressed in viewBox units and the
box did, which leaves every bubble exactly the size it was.

This costs bytes: `geo-map.world.ts` goes from 5.6KB to 23.8KB gzip and the measured
bundle from 161.5KB to 180.8KB, so the JS size budget moves from 160KB to 192KB. The
whole increase is one generated data module of two string constants, and it
tree-shakes out for consumers who never import GeoMap.
