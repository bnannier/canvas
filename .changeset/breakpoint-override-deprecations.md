---
"@nannier/canvas": patch
---

`SsrBreakpointContext` and the `useWindowDimensions` pass-through are deprecated aliases (the owner's K12-2 decision and its OD5): each keeps working until a major, and its `@deprecated` text names what to use instead. For `SsrBreakpointContext`, pass ThemeProvider's `ssrBreakpoint` prop. For `useWindowDimensions`, use `useBreakpoint` or `useFormFactor` for window-level chrome, `useContainerWidth` or `useMeasuredWidth` inside a component, or React Native's own `useWindowDimensions` for raw pixels.
