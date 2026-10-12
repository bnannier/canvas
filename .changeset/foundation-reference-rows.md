---
"@nannier/canvas": patch
---

`docs:gen` writes the `/foundation` reference's rows (`docs/src/core/foundation-reference.ts`) from `tools/api/manifest.ts` and the source: every deprecated alias with its declaration's summary, its `@deprecated` text and its replacement's docs route, and `docs:gen --check` fails when they drift. `check:api` reads those rows as part of the page and now requires every deprecated alias's `@deprecated` text to say what to use instead and to name its replacement when it has one. Repository tooling only; nothing in the package changes.
