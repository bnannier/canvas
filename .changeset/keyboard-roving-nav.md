---
"@nannier/canvas": minor
---

Add web keyboard operability to the composite selection widgets. A new shared
`useRovingFocus` hook implements the WAI-ARIA roving-tabindex pattern (one tab stop,
arrow keys move and activate, Home/End jump, RTL-aware horizontal arrows), and it is
wired into:

- `Tabs`: arrows move between triggers (horizontal, or vertical for the rail).
- `RadioGroup`: arrows move and select options (all four arrows, APG radiogroup).
- `Listbox`: arrows move a focus cursor; single-select follows focus, multi-select
  toggles the focused row on Enter/Space.
- `Dropdown` menu: opening focuses the first row, arrows move focus, Enter/Space
  activates.
- `Command`: the search row is now the focusable driver; ArrowUp/Down move the
  highlighted row (aria-activedescendant follows) and Enter selects it, implementing
  the keys the footer already advertised.

All widgets stay operable by Tab + Enter/Space as before; the change adds arrow-key
navigation and a single roving tab stop on the web. Native behavior is unchanged
(the handlers never fire there). `RadioGroup`'s context value is now memoized, so a
parent re-render no longer re-renders every radio.
