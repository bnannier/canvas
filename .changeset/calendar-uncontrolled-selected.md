---
"@bnannier/canvas": patch
---

Make Calendar day selection interactive out of the box: `selected` is now the controlled day, a new `defaultSelected` seeds uncontrolled use, and selection routes through the shared controllable-state contract. Pressing a day now highlights it (and still fires `onSelect`) instead of leaving the grid inert. Month prev/next still fire `onPrev`/`onNext`; self-traversal stays a caller concern since Calendar takes a month label plus day counts, not a date model.
