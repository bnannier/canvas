---
"@nannier/canvas": patch
---

One reader for the platform reference catalog: `tools/skins/references.ts` reads `PLATFORM-REFERENCES.md` and maps a docs component to its row (the aliased Stepper, Emblem and Drawer rows and the one charts row) for the audit facts, the shape gate and the docs coverage report alike. The coverage report used to strip names with a parser of its own, with no aliases and no charts row, so it listed 48 components without a row where 18 had none; it now reports the 18, and `--strict` fails on a component without a row. A test fails any module that reads the catalog without going through the reader. Repository tooling and docs only; nothing in the package changes.
