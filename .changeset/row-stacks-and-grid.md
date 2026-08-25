---
"@nannier/canvas": minor
---

Responsive layout primitives: Row `stacks` and the new `Grid`.

Minor justification (new public capability):

- `Row` gains `stacks` (+ `stackBreakpoint`, default `sm`): the row renders as
  a Column when its OWN container is at or below the breakpoint,
  container-measured with a viewport seed, so it stacks inside a narrow desktop
  column too. When stacked the Row is exactly the Column with the same props
  (gap/justify/align/padding apply to the new axes, `wrap` is inert). Children
  keep their own sizing, which makes `stacks` the tool for content-sized rows
  (toolbars); ignored with a DEV warning on Column.
- New `Grid` + `GridItem`: the container-measured auto-fit tile grid.
  `minTileWidth` (default 240) sets the floor, `columns` caps the desktop
  count, the gap scale is Row/Column's own booleans, and `GridItem wide` spans
  two cells. Pure math (`gridColumns` / `gridCellWidth`, exported) resolves the
  count from the measured container: no breakpoints at the call site, one
  measurement per grid, zero hooks per tile.
