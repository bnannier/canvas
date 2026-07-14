---
"@nannier/canvas": patch
---

Make the Steps component's active step interactive. `current` was a required, controlled-only prop, so pressing a step (with `onStepPress`) never moved the highlight. `current` is now optional and controlled, a new `defaultCurrent` seeds uncontrolled use via the shared controllable-state contract, and pressing a step moves the active step and still fires `onStepPress`.
