---
"@nannier/canvas": patch
---

Internal cleanup with no API or visual change: the kit drops unused imports and locals, and Chat drops six Markdown styles left behind when Markdown moved to its own style module. The unused `react-test-renderer` and `@eslint/js` dev dependencies are gone.
