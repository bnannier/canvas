---
"@nannier/canvas": patch
---

Add the kit's internal axis primitive (`src/style/axis.ts`): a style axis is declared as data, an ordered list of boolean members with the value each resolves to and a fallback, and `pick` resolves the highest-precedence member a component's props set, the way the measure axis already reads the width scale's declaration order. The primitive loads nothing but the tokens, so the docs generator can read axis tables without React Native. Nothing resolves through it yet and the package does not export it; no prop or behaviour changes.
