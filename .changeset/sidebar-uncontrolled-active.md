---
"@olympusoss/canvas": patch
---

Make Sidebar navigation interactive out of the box: `active` is now the controlled row, a new `defaultActive` seeds uncontrolled use, and the active row routes through the shared controllable-state contract. Pressing a nav row now moves the highlight (still firing `onSelect`) instead of leaving it stuck on the initial row.
