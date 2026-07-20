---
"@nannier/canvas": minor
---

Stepper: `label` now renders as a VISIBLE, component-owned title above the ± control (matching how Input places its label) instead of only feeding the accessible name. The label names the whole adjustable group via accessibilityLabel + aria-labelledby, and a new `description` prop adds a muted secondary line under it (`required` appends the destructive "*" and sets aria-required, both only alongside `label`). Placement is platform-adaptive through the skin: iOS the SF field-label (semibold, -0.15 tracking), web the 500-weight title, Android the M3 label (medium, 0.1 tracking) kept above the control since a ± button row has no filled field box to float an in-container M3 label into. A bare `<Stepper />` (no `label`) is unchanged: it keeps the invisible "Number" accessible-name fallback and renders no visible label.
