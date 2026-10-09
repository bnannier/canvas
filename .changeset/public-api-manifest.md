---
"@nannier/canvas": patch
---

The kit's public surface is now an explicit, checked list: `tools/api/manifest.ts` classifies every export of `@nannier/canvas` (component, part, hook, token, utility, type, deprecated alias, or internal by accident) and every file under `@nannier/canvas/styles/*`, each with the docs page that names it or `undocumented`. `bun run check:api`, run by the pre-push hook and CI, fails when an export or a file is added or removed without an entry, when the iOS or Android resolution of the native entry exports a different set from the web build, when a kind disagrees with the source, or when a named docs route does not exist or never names the export. No export is added, removed, renamed or deprecated. Repository tooling and docs only; nothing in the package changes.
