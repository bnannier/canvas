---
"@bnannier/canvas": major
---

rename the `IconTile` atom to `Emblem`

The tinted rounded-square-or-circle that holds an icon or a short monogram is
now `Emblem` (with `EmblemProps`), a name that fits the monogram path as well as
the icon path. This is a breaking rename: the `IconTile` and `IconTileProps`
exports are removed. Update imports from `IconTile` to `Emblem`. The docs page
moved from `/components/icon-tile` to `/components/emblem` (the old URL redirects).
