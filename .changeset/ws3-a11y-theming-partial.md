---
"@olympusoss/canvas": minor
---

Accessibility, keyboard, and theming improvements.

- **Escape dismisses anchored overlays.** New `useEscapeKey` hook wires
  Escape-to-close on the web for `Dropdown`, `Popover`, `Select`, `Combobox`,
  and `RowMenu` (no-op natively).
- **Toast announcements are reliable.** `ToastProvider` now hosts a single,
  persistently-mounted polite live region and swaps capsules inside it, so
  screen readers announce toasts (previously each capsule's region mounted with
  its content and was routinely missed).
- **Charts expose their data to assistive tech.** `StackedBar` and `Heatmap`
  gain a `label` prop and build an accessible name from the data itself
  (e.g. "Traffic sources: Direct 42%, Search 28%, …"); the `img` role no longer
  suppresses the visible legend.
- **The kit is rebrandable.** `ThemeProvider` accepts a `tokens` prop
  (`Partial<ColorTokens>` for both schemes, or `{ light, dark }` per scheme)
  merged over the base tokens, so consumers can change `primary` (and any token)
  without forking. Glass overrides still compose on top.
