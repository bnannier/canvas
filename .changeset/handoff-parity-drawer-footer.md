---
"@nannier/canvas": patch
---

Hand-off parity: drop the `Drawer.footer` open-gap record, which the kit closed when `DrawerProps` gained `footer`, and regenerate HANDOFF-PARITY.md so `check-parity:check` passes again. Repository tooling only; nothing in the package changes.
