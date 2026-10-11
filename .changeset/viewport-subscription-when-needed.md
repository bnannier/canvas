---
"@nannier/canvas": patch
---

Under a `BreakpointOverride`, `useBreakpoint`, `useResponsive` and `useFormFactor` no longer subscribe to the window. The override is their answer, yet each held the window subscription and re-rendered on every real bucket crossing, for example the docs' simulated phone while the browser window was resized. Outside an override nothing changes.
