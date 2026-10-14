---
"@nannier/canvas": patch
---

On iOS a glass surface's material now keeps its skin's continuous corner. A skin with iOS's continuous corner curve (a Card, the stacked and description lists, Feeds, Stats, a MediaObject, an EmptyState, an Accordion, a Collapsible, the Drawer sheet) kept it on its own view while the material under it took the corner radii alone, so under glass the clip, the frost, the rim and Liquid Glass drew the circular corner where solid mode draws the continuous one. The material now takes the host's `borderCurve` with its radii on every layer. The web, which has no corner curve, and solid mode are unchanged.
