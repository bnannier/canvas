---
"@olympusoss/canvas": minor
---

Every input-like control now renders at a standard width by default, so bare
fields look even without per-call-site width shims. Input, Textarea, Select,
Combobox, and Field (control mode) render at 320px on desktop, shrink inside
narrower parents (`maxWidth:"100%"`), and fill their container at the `sm`
breakpoint (≤640px) and below, the phone form factor. The new width axis picks
the other modes: `narrow` (240px) for toolbars and short values, `wide`
(480px) for long values and roomy multiline entry, and `block` to fill the
container at any viewport. The explicit width is deliberate: it standardizes
fields even in centered or content-sized layouts, where a bare `width:"100%"`
would collapse each field to its placeholder text's natural width.

`block` on Input, previously a documented no-op, now does exactly what it says.
Field, Form, Fieldset, Dialog, and AlertDialog compose their inner Inputs with
`block`, so form and dialog layouts are unchanged; Textarea's `flush` implies
`block` (the framed container is the field edge); Field's read-only `rows=`
display mode stays unsized. If a consumer relied on a bare field stretching
with its container past 320px (a full-bleed toolbar search, for example),
`block` is the one-word restoration.

The docs examples drop their ad-hoc maxWidth wrappers accordingly, and the
docgen style guardrail now rejects new `maxWidth`/`minWidth` shims placed
directly on these controls in example/Do fences.
