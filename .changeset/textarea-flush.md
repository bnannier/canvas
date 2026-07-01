---
"@olympusoss/canvas": minor
---

Add a `flush` prop to `Textarea` that drops the field's own border and radius so
it sits flush inside a framed container (e.g. a Card with a formatting toolbar
above it), instead of hand-zeroing `borderWidth`/`borderRadius` via `style`.
