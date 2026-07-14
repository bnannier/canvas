---
"@olympusoss/canvas": major
---

`InputOTP` is now controllable both ways and its change callback is renamed
(breaking). `value` is optional, a new `defaultValue` seeds uncontrolled use, and
the field is routed through `useControllableState`, so a bare `<InputOTP />` is
typeable out of the box (previously `value` and `onChange` were required and a bare
field would not compile). The change callback is `onChangeText` (was `onChange`),
matching `Input` / `Textarea` / `Field`. Migrate by renaming the callback, and drop
the now-optional `value` for uncontrolled use: `<InputOTP value={code} onChange={setCode} />`
stays valid as `<InputOTP value={code} onChangeText={setCode} />`, and
`<InputOTP defaultValue="123" />` now works with no handler at all.
