---
"@nannier/canvas": minor
---

Four new Typography capabilities, the user-visible additions this minor carries, all
from the v4 hand-off's component page. `code inline` is the prose code chip, a word of
code inside a sentence: regular weight at .88 of the reading role passed beside it
(`lead`, `small`, `pageBody`, `pageNote`, `pageLead`, `sectionLead`; body when none), a
5 radius, 1 by 5 padding, the surface fill and a hairline rim, the hand-off's inline
`<code>` from its Markdown helper; `<Typography code>` is unchanged. `pageLabel` is the
page's own label (a panel's "Props", a rail's group header, a table's header cell, a
previous/next eyebrow): 500 11/1 mono tracked .08em in caps, in the subtle ink, where the
`eyebrow` stays the type table's accent-ink label. `guideTitle` (600 16/1.3, a level-3
heading) and `guideBody` (400 13.5/1.6 in the secondary ink) are the Usage guidance
card's title and paragraph. The docs' inline Markdown sets every code span on the chip at
its paragraph's size and the accessibility cards, the knob panel and the previous/next
cards take the page label.
