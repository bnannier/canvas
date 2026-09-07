---
"@nannier-com/canvas": patch
---

Restore guarded development hook installation in fresh and moved checkouts. Run local checks fail-fast against freshly built package output, and skip hook setup in CI, production, and published-package installs.
