---
"@nannier/canvas": patch
---

Make the segmented ButtonGroup interactive out of the box: `active` is now the controlled index, a new `defaultActive` seeds uncontrolled use, and selection routes through the shared controllable-state contract (matching Tabs/Switch). A bare or `defaultActive`-seeded segmented control now selects the pressed segment on press instead of sitting inert.
