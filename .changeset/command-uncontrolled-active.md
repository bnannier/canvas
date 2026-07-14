---
"@nannier/canvas": patch
---

Make the Command palette highlight interactive. The active row was controlled-only, so the highlight sat frozen on the initial row. `active` is now the controlled highlight with a new `defaultActive` for uncontrolled use, the highlight moves to a row on hover and press, and a new `defaultOpen` renders the palette open initially while staying closeable. Selecting a row still fires `onSelect` and closes the palette.
