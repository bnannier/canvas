---
"@nannier/canvas": minor
---

Tabs items accept a per-item `disabled` flag: an item may now be `{ label, badge?, disabled? }`, and a disabled trigger renders through the skin's dimmed disabled treatment, is not pressable, sits out of the tab order, is skipped by the roving arrow-key navigation (Home/End redirect to the nearest enabled tab), and announces itself via `accessibilityState.disabled` plus the `aria-disabled` alias.

Minor justification: new user-visible capability on the public Tabs API (individually disabled tab triggers on the existing `tabs` items array).
