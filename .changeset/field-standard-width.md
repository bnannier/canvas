---
"@nannier/canvas": minor
---

Every input-like control now renders at a standard width by default, so bare
fields look even without per-call-site width shims. Input, Textarea, Select,
Combobox, and Field (control mode) render at 320px and shrink inside narrower
parents (`maxWidth:"100%"`), which is how the phone form factor is handled.
The new width axis picks the other modes: `narrow` (240px) for toolbars and
short values, `wide` (480px) for long values and roomy multiline entry, and
`block` to fill the container. The explicit width is deliberate, and holds on
every form factor: in a centered or content-sized layout a bare `width:"100%"`
collapses each field to its content's natural width, uneven per platform and
resizing on every keystroke.

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
