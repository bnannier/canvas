---
"@olympusoss/canvas": minor
---

Icon: greatly expand the built-in glyph set (from ~33 to 85 glyphs) so an app can
build its full navigation and chrome from the kit `Icon` without an external icon
package. New glyphs cover app chrome (`menu`, `moon`, `sun`, `arrowRight`,
`appWindow`, `layers`, `rocket`, `circleCheck`, `circleX`), navigation/content
(`alignLeft`, `award`, `barChart2`, `bookOpen`, `box`, `chartLine`, `checkSquare`,
`chevronsLeft`, `circleDot`, `columns2`, `fileInput`, `fileText`, `folder`,
`footprints`, `gauge`, `gitCompare`, `group`, `image`, `inbox`, `keyboard`,
`layout`, `layoutGrid`, `list`, `listChecks`, `loader`, `messageCircle`,
`messageSquareWarning`, `minus`, `moreHorizontal`, `mousePointerClick`,
`moveVertical`, `navigation`, `palette`, `panelRight`, `plug`, `pointer`,
`smartphone`, `square`, `table`, `terminal`, `textCursorInput`, `toggleLeft`,
`type`).

Also add a `success` color prop to `Icon` (scheme-aware palette green), matching
the success tone Alert, Badge, and EmptyState already use, so positive status
glyphs round out the existing `destructive` option.
