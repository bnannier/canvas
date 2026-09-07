---
"@nannier-com/canvas": patch
---

Fix published native module resolution so stock Metro selects iOS and Android
skins and material helpers. Preserve the web ESM build and public declarations,
watch both outputs during local development, and verify the sealed package in an
isolated native consumer with optional peers omitted before CI publication.
