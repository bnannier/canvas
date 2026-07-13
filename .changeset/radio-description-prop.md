---
"@olympusoss/canvas": minor
---

Add a `description` prop to `Radio` so the common title-plus-description option
is built in, not hand-composed at the call site.

The most common radio-group shape (a plan picker, a settings choice) pairs each
option's title with a muted secondary line. Until now the control only rendered a
single-line label, so every caller had to wrap each `<Radio>` in a `Row` + `Column`
+ two `Typography` nodes to get the title/description stack, roughly eight lines of
scaffolding per option. `Radio` now takes a `description?: ReactNode`; supplying it
renders the muted line under the label, ring aligned to the first text line, inside
the control. This mirrors the existing `Switch` convention (`children` is the title,
`description` is the secondary line).

A full three-option group collapses from a nested `RadioGroup` / `Column` / `Row` /
`Typography` tree to:

```tsx
<RadioGroup defaultValue="pro">
  <Radio value="hobby" description="For personal projects and experiments.">Hobby</Radio>
  <Radio value="pro" description="For growing teams that need more control.">Pro</Radio>
  <Radio value="enterprise" description="Advanced security, compliance, and support.">Enterprise</Radio>
</RadioGroup>
```

Additive and backward-compatible: a label-only `<Radio>` renders exactly as before.
