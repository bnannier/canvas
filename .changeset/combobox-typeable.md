---
"@nannier/canvas": minor
---

`Combobox` is actually typeable. The field is now a real `TextInput` (was a
static `Pressable`, so users could not type): keystrokes edit the query and
filter the option list live. The query joins the controlled + uncontrolled
contract via `useControllableState`: the existing `query` prop keeps working
(controlled), new `defaultQuery` seeds uncontrolled use (a bare `<Combobox />`
filters as you type), and new `onQueryChange` fires in both modes (including
with `""` when a select resets the filter). Focus or typing opens the list and
the trailing chevron toggles it; selection, skins, and the option-list a11y are
unchanged, the field itself now announces as `role="combobox"` with
`aria-expanded`. Also adds `testID` and a forwarded ref to the text field
(`focus()` works), with a `displayName`.
