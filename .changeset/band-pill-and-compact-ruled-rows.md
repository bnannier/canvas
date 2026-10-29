---
"@nannier/canvas": minor
---

Two new options from the v4 hand-off's component page, the user-visible additions this
minor carries. Badge gains `band` on its metrics axis (between `tier` and `small`): a
group band's pill, the props table's "pick one" beside an axis's title, 20 px tall with a
7 px inset, no border and a 500 11 px label on the small pill's 14 px line, in the code
face with `mono` and in the tone axis's fill (the accent's soft pill with none), where
`small` is 18 tall with a 6 px inset. DescriptionList gains `compact`, its density axis:
on a `ruled` list the rows take the hand-off's semantics-card metrics, 8 above and below
the text, 12 to the value, the two-column term a fixed 110 column and the value at the
top of its row (so a wrapping row of badges starts level with its term); the plain and
divided rows have no compact step, and iOS keeps its centered 52pt Lists row with the
fixed column and the gap. The docs' props-table bands take `band` and the accessibility
Semantics list takes `compact`, so the Intent band is the hand-off's 41 px and the
Semantics rows its 8 px inset.
