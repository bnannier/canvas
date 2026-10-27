---
"@nannier/canvas": minor
---

CodeBlock gains `headerless`, a new public option that highlights by `language` without drawing the language or filename header bar (justification for the minor: a new component prop). Fixes found building the v4 component detail pages: a nested Text now keeps the face of the run it sits in, so CodeBlock's highlighted tokens paint in the mono face instead of the interface face once an app registers fonts; a DescriptionList node value yields to its cell, so a wrapping Row in a `twoColumn` list wraps instead of overflowing the card; and the Select selection checkmark is decorative, kept out of the option's accessible name on web, iOS and Android.
