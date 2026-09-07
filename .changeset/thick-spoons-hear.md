---
"@nannier-com/canvas": minor
---

New public API: `tabularNums()`, a text style that gives every digit the same width.

Minor justification: this adds a capability consumers can use directly, exported from
the package root beside `shadow()` and `alpha()`. Spread it into any text style that
shows numbers read down a column or watched as they change:
`{ ...tabularNums(), fontSize: 14 }`.

It exists because the two platforms spell this differently and the kit only knew one
spelling. `fontVariant: ["tabular-nums"]` is React Native's API and works on iOS and
Android; react-native-web DROPS it, emitting no inline style, no generated class and no
warning, so the element renders exactly as if nothing had been asked for. Every
tabular-figure call site in the kit, in Progress, Slider and seven charts, was therefore
a no-op in a browser. The web branch emits `font-variant-numeric`, the CSS property that
actually does this, and all eighteen call sites now go through the helper.

Two components gain the treatment they were missing. A DataTable column marked `numeric`
now uses tabular figures in its cells and in its inline editor, so a column of amounts
lines up on the decimal instead of drifting, and opening a cell to edit does not reflow
the number under the caret. Stats does the same for its headline value and its delta, so
a figure that updates in place stops jittering as its digits change.

Unrelated, in the same neighbourhood: the Heatmap's weekday gutter labels were 9px,
below the 10px the platforms themselves treat as the floor and smaller than the month
labels directly above them. They are 10px now, and the gutter widened to fit them.
