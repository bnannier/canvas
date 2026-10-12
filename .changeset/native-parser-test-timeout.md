---
"@nannier/canvas": patch
---

The native flow parser's regression tests all carry one 30 s budget. Each starts the pinned Maestro's JVM, which takes 4 to 9 s on a CI runner, and five of them ran under bun's 5 s default when CI runs the file on its own, so one timed out on the iOS smoke (the owner authorized the budget, 2026-10-12). Repository tooling only; nothing in the package changes.
