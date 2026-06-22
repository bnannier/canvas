---
"@olympusoss/canvas": minor
---

Fix a kit-wide audit (94 adversarially-verified findings across 52 components): real bugs, systemic web-accessibility gaps, and dead public props.

**Bugs**
- Carousel no longer crashes on an empty `items` array. Slider and Charts sanitize NaN/Infinity inputs instead of producing NaN geometry. Textarea clamps `rows` to at least one line. Combobox blocks selection when `disabled`. Accordion normalizes the single-open "" sentinel. The web Spinner skin no longer runs a perpetual no-op animation loop. Code Block's prompt and line-number gutter are no longer selectable. Sidebar resolves `active` to a single row even when labels collide. Several data-driven lists (Feeds, Action Sheet, Data Table, Sidebar, Stacked Lists) accept an optional stable `id` so reorder/insert no longer misbinds rows.
- Field's Copy button is now functional via a new `onCopy?: (value) => void` prop. Alert Dialog's `withInput` field actually gates confirmation (new `confirmText` prop, default "DELETE").

**Accessibility (web + native)**
- State and value now reach web screen readers everywhere via `aria-*` aliases (react-native-web drops `accessibilityState`/`accessibilityValue`): `aria-disabled` (Dropdown, Slider, Pagination, Tabs, Number Input), `aria-checked` (Filter Panel), `aria-selected`/`aria-current` corrections (Pagination, Navbars).
- Correct ARIA roles: Tabs gets a `tablist`, Dropdown/Command/Listbox option lists get `listbox`/`menu` containers, Breadcrumb is a `navigation` landmark with `aria-current="page"`, Typography headings expose a heading role + level, Charts expose a labeled group, Toast is a polite `status` region.
- Accessible names where they were missing: pressable Avatars, Data Table rows, the Row Menu / icon-only triggers, QR codes, the Action Sheet / Drawer scrims, and Form / Field / Alert Dialog inputs (labels are now programmatically associated, with helper text wired via `aria-describedby`).
- Disclosure state (`aria-expanded`) on Popover, Combobox, and Row Menu triggers; busy/loading semantics on Button, Skeleton, and Alert; decorative icons and separator glyphs are now hidden from assistive tech.

**Shared atoms extended** (backward-compatible): `Switch` and `Avatar` and `Icon` and `Input` gain `accessibilityLabel`; `Icon` gains `decorative`; `Avatar` gains `initials`; `Input` gains `aria-labelledby`/`aria-describedby`; `Button` announces `aria-busy` when `loading`.

**Dead props removed**: `Card.interactive`, `Navbar.children`, and Code Block's no-op `filename`/`language` on non-terminal variants; `DescriptionList.stacked` is now honored.
