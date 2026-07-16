---
"@nannier/canvas": minor
---

Typography: add a `tightLeading` leading axis.

A fourth axis alongside role, tone, and weight. It pulls the line box in to 1.25x the
font size for a stacked lockup, where two lines read as one unit (a wordmark over its
tagline, a title over its subtitle) and the roles' reading leading leaves dead air
between them. Previously nothing could close that space: the leading is baked into each
role, a Column's gap can only add, and `lineHeight` at a call site is a banned restyle.

`tightLeading` only ever tightens, clamping against the role's own line height, so it is
safe on every role including the already-tight display scale (`display` 48/48, `h1`
36/40). Omit it for prose, where the role's line height is the reading value. Additive
and backward-compatible: no existing call site changes.
