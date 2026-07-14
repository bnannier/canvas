---
"@bnannier/canvas": patch
---

Make Navbar links interactive out of the box: `active` is now the controlled link index, a new `defaultActive` seeds uncontrolled use, and the active link routes through the shared controllable-state contract. Links are now always pressable (previously they were inert unless `onSelect` was passed), so pressing a link moves the active highlight and still fires `onSelect`.
