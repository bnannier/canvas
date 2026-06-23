---
"@olympusoss/canvas": patch
---

Finish the input label-association accessibility pass. Fieldset, Field, and Dialog now wire every visible label to its control via `aria-labelledby` + `accessibilityLabel` (and helper/error text via `aria-describedby`), matching Form and Alert Dialog, so no composed field is announced as an unlabeled edit field on web or native. A Fieldset row no longer wraps its lone control in a redundant `role="group"` (the set's grouping comes from the Fieldset legend).
