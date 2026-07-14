---
"@nannier/canvas": minor
---

Accessibility improvements to `Sparkline`, `Popover`, and `Button`.

- `Sparkline` now always carries an accessible name: when `accessibilityLabel` is
  omitted it derives a summary of the data (point count, range, latest value), so it
  never ships as an unnamed `role="img"` (WCAG 1.1.1).
- `Popover` moves focus into its panel when the floating card opens and restores
  focus to the trigger on close (non-modal, so no focus trap), and its trigger now
  announces the popup relationship.
- `Button` gains a `haspopup` prop (aria-haspopup) for menu / dialog / listbox
  triggers, pairing with the existing `expanded` (aria-expanded).
