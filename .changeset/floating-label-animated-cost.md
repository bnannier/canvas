---
"@nannier/canvas": patch
---

The Android floating label does no animated work while a user types or as a form mounts. It built three new animated nodes on every render, and a field re-renders on every keystroke, so React Native attached a new animated graph per keystroke; it now keeps its nodes while their ends hold. And a field that mounts at rest or filled no longer starts two empty 150 ms timings.
