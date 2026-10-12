---
"@nannier/canvas": patch
---

Every deprecated alias the kit declares says what it was in its JSDoc summary, the hover an editor shows (React Native's own `StyleSheet` and `useWindowDimensions` stay React Native's to document): the 24 that had none (among them `FOCUS_RESET`, `MONO_FONT`, `isRTL`, the ripple and touch-target helpers, `useRovingFocus`, `useHardwareBack`, `useWheel` and their option types), `brandColors` and `HUE_WASH`. `check:api` now requires a summary on every deprecated alias, value or type, beside its `@deprecated` text. Documentation only; no runtime change.
