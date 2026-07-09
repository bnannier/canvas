---
"@olympusoss/canvas": patch
---

Make Combobox selection interactive out of the box. The selected `value` was controlled-only, so picking a row fired `onSelect` but the field never showed the choice. `value` is now the controlled selection with a new `defaultValue` for uncontrolled use, routed through the shared controllable-state contract, and a new `defaultOpen` renders the list open initially while staying closeable (parity with Select). Selecting a row now fills the field and marks the option, and still fires `onSelect`.
