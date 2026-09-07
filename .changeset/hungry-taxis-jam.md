---
"@nannier-com/canvas": patch
---

Autocomplete: Escape closes the option list when the caret is in the field.

The shared `useEscapeKey` hook listens on the document, which covers focus on the
chevron or anywhere else on the page. It never covered the case that matters most for
a combobox: someone typing a query and pressing Escape to abandon it.
react-native-web's TextInput does not let an Escape keydown out of the input, so the
document listener never heard it and the list stayed open, with `aria-expanded` stuck
at true.

Two test suites asserted Escape worked and both passed, because both opened the list
by clicking the chevron, which leaves focus on a button. Driving a real browser is
what surfaced it. The field now handles the key itself through React Native's own
`onKeyPress` channel, so every way in has a way out, on every platform that reports a
key.
