---
"@nannier/canvas": minor
---

Add RadioGroup, a single-select group for Radio options, and make radios interactive out of the box. A radio (unlike a checkbox) can't be the source of its own on/off state, so a bare `<Radio checked>` in the docs never moved the dot on press. RadioGroup owns the selection (controlled via `value`, uncontrolled via `defaultValue`, `onChange` fires the chosen value) and shares it with child `<Radio value="…">` controls through context, so exactly one is chosen and pressing another moves the selection. Radio gains an optional `value` prop and reads its checked state and disabled state from the enclosing group; used standalone it keeps its existing controlled `checked`/`selected` behavior. Layout is a column by default, `row` for a wrapping inline row.
