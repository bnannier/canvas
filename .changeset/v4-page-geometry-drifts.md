---
"@nannier/canvas": minor
---

Closes the component page's small geometry drifts against the v4 hand-off, measured element by element on the served hand-off and the shipped page. New public options (the justification for the minor): Badge `disc`, a legend's 22 px numbered disc in the tone axis's fill with no ring or shadow, and Badge `tier`, the 24 px tier pill beside a page title; Typography `pagerLabel`, `legendLabel` and `tileCaption`, three page roles the hand-off sets with no line ratio, each on its face's own measured normal line (14, 18 and 16 px). Value corrections: the Breadcrumb's crumbs sit on the hand-off's 16 px normal line instead of 18, so a page header no longer runs 2 px tall; a Row span cell and a Grid cell keep their width to a hundredth of a pixel instead of a whole-pixel floor, so tiles and pager cards sit where the hand-off's tracks do; CardMedia's `stage` well is 318 inside its hairlines, the hand-off's 320 border box.
