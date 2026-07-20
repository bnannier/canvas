---
"@nannier/canvas": minor
---

Progress gains component-owned label anatomy, mirroring Checkbox/Radio/Switch's `description`: pass the title as `children`, a muted secondary line as `description`, and `showValue` to render the percent (derived from `value`) as a right-aligned, tabular readout on the title line. The control stacks the header above the bar and owns the label typography (14/20 medium title, 12/16 muted description, 14/20 muted value readout), so callers stop hand-composing a Row/Column + Typography around the bar. Indeterminate keeps the label but drops the percent (no measurable value). A bare `<Progress value={...} />` is unchanged, and a string title also supplies the accessible name when no `accessibilityLabel` is given.
