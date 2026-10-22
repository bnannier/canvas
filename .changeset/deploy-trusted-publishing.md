---
"@nannier/canvas": patch
---

The Deploy workflow publishes to npm through Trusted Publishing: the publish job holds `id-token: write`, exchanges the GitHub OIDC token for a short-lived npm credential bound to this repository and workflow (configured on npmjs.com for `@nannier/canvas`), reads no NPM_TOKEN, and asserts npm 11.5.1 or later before the accept push so a too-old npm cannot consume a version. Every publish since the 2026-09-27 move back to `@nannier` had failed with npm EOTP. Repository workflow only; nothing in the package changes.
