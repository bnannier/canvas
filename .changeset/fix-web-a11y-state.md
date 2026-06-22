---
"@olympusoss/canvas": minor
---

Fix a systemic web accessibility gap, and give Button a disclosure prop.

react-native-web forwards NEITHER `accessibilityState` NOR `accessibilityValue` to the DOM, so any component that conveyed its state only through those was silent to web screen readers. Components now also carry the cross-platform `aria-*` aliases (RN 0.71+ accepts them; RNW forwards them; native maps them back), so selected / checked / expanded state and slider/progress values reach assistive tech on every platform:

- `aria-checked` — Checkbox (including the `mixed` indeterminate state), Switch, Radio, FilterPanel.
- `aria-selected` — Tabs, TabBar, ButtonGroup, Listbox, Pagination, Calendar, Navbar, Sidebar.
- `aria-expanded` — Dropdown, Select, Combobox, ButtonGroup split menu (and the existing Accordion/Collapsible).

`Button` gains an **`expanded`** prop: a Button that toggles a menu/popover can now announce `aria-expanded`. The Dropdown's default trigger uses it, so the common (non-custom-trigger) Dropdown is now accessible.

Adds a `test/a11y-state.test.tsx` suite asserting these attributes actually reach the DOM under react-native-web.
