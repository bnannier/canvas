---
"@nannier/canvas": patch
---

Card's linked-reference modes take the v4 hand-off's look: `referenceInline` is a 36 px
bordered pill (the open glyph, the key, the summary, then the status), `referenceStacked` a
bordered box up to 320 wide with the key, summary and status stacked, `referenceTile` a
180 by 120 tile with the key at the top and the summary at the bottom, and
`referenceDetail` a box up to 360 wide with the source chip beside the key. Every mode sits
on the card surface under a hairline with the small resting shadow, the key in the
accent's mono ink. The props are unchanged.
