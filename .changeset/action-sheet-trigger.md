---
"@nannier/canvas": minor
---

Add an optional `trigger` prop to ActionSheet, matching Dialog and Drawer.

ActionSheet was controlled-only (`open` was required), so every rendered example
forced a full-screen Modal open at once. It now accepts a `trigger` label: when
set, it renders its own button and opens itself on press (uncontrolled internal
state), and `open` is optional. Driving `open` / `onOpenChange` yourself still
works exactly as before, so the change is backward compatible.
