---
"@nannier/canvas": minor
---

DescriptionList: the inline-edit CTA now works out of the box. Pressing a row's trailing "Update" link opens a real in-place editor (the value swaps for a draft text input with Save / Cancel links); Enter or Save commits the new value and fires the new `onUpdate(index, value)` callback, Escape or Cancel dismisses it. The edited values follow the kit's controlled + uncontrolled contract at list granularity: a consumer that ignores `onUpdate` gets the working uncontrolled behavior (the list keeps the committed value itself), and a consumer that answers `onUpdate` by passing new `items` stays in control (the prop value always wins over the internal copy).
