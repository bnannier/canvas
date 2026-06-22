---
"@olympusoss/canvas": patch
---

Give Select, Combobox, and Command proper ARIA listbox semantics. Their option rows were `role="button"` with no selection state, so a screen reader heard a pile of buttons rather than a selectable list. The option list is now `role="listbox"` and each row is `role="option"` with `aria-selected`; Command additionally wraps each group in `role="group"` labelled by its heading. The rows stay fully operable (click and Enter/Space still select), verified under react-native-web. (React Native's `Role` type omits the valid ARIA `listbox` value, so the container role is cast.)
