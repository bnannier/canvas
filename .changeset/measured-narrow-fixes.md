---
"@nannier/canvas": patch
---

Measured narrow-container fixes for Calendar, DataTable, DescriptionList, and
Board.

- Calendar month: the grid container is now capped at 100% of its parent and
  the seven day cells shrink fluidly (32px floor) when the measured container
  is narrower than the natural grid, so a month calendar fits a 320pt phone
  instead of overflowing. Week/day timelines are untouched (they already
  flexed).
- DataTable: the 320px minimum-width floor now drops once the table has
  measured a container narrower than the sm breakpoint, where the existing
  collapse/pan machinery guarantees readability; previously the floor clipped
  on 320pt devices.
- DescriptionList `twoColumn`: the fixed 160px term column narrows to 120px at
  phone widths (restores the pre-refactor behavior lost when Field's display
  rows moved here), keeping the value column readable.
- Board: lanes now fit a measured narrow board (lane fills the width minus a
  32pt peek of the next lane, 240px floor) instead of staying at the configured
  300px regardless of screen size; `columnWidth` still sets the desktop lane.
