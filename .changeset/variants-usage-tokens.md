---
"@nannier/canvas": minor
---

Five new capabilities from the v4 hand-off's component page, the user-visible additions
this minor carries. Typography gains three page roles, each in the interface face and the
foreground ink: `variantTitle` (a variant card's title over its note and snippet, 500
14/1.3, Component.dc.html line 185), `linkName` (a link tile's name beside its arrow, 600
14 on the face's own 18 line, line 297; the hand-off sets no ratio, and the line is
Chromium's `normal` for Instrument Sans measured on the hand-off page) and
`subsectionTitle` (a section's own sub-heading over a grid of tiles, 600 16 on the face's
own 20 line measured the same way, line 296; a level-3 heading). CodeBlock gains two
members on its density axis, after `compact` and `playground`: `snippet` (the page's own
snippet, line 283: the code-card corner with the code 16 above and below and 18 in at the
default 13 / 1.7 ramp) and `guide` (a card's snippet, line 288: a 10 px corner, the web
row's new `cardSnippet` role, with the code 12 above and below and 14 in at 12 / 1.65).

The docs' component page takes them: a variant card's title is the `variantTitle`, the
Usage section's block is a `snippet` and each guidance card's block a `guide`, the
guidance card's title and paragraphs are the `guideTitle` and `guideBody` roles (its
inline Markdown and lists accept `guideBody`), the Tokens section's "Related components"
is the `subsectionTitle` 32 below the chips and 16 over its grid, and each related tile
draws its name as the `linkName` over its room as the caption in its own subtle ink. The
Button docs' "Icon ink per intent" row wraps, so its six buttons fold inside a narrow card
instead of running past its edge.
