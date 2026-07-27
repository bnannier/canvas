---
"@nannier/canvas": minor
---

**`Dialog` gained `accessibilityLabel`.** New capability: a dialog whose body is
supplied as `children` can now carry an accessible name.

Children REPLACE the built-in title and description, so there is no element left
for `aria-labelledby` to reference and the dialog was announced with no name at
all. That is poor for a `dialog` and invalid for the `alertdialog` that a
`destructive` confirm renders, and there was no way to fix it from the call site
because the prop did not exist. Dialogs using the data-driven `title` path are
unaffected and keep naming themselves.
