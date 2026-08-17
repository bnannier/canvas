---
"@nannier/canvas": minor
---

ThemeProvider speaks the color scheme in boolean grammar: `<ThemeProvider dark>` forces the dark scheme, `<ThemeProvider light>` the light one, and passing neither follows the OS appearance, matching the glass/solid surface axis and every component axis (the prop name is the value). Axis first-match: `dark` wins over `light`, and both win over the legacy `scheme` value prop, which stays supported for config-driven code that already holds a scheme value (a stored preference, an `<html>` hook). `ssrScheme` and the resolved `useTheme().scheme` are untouched.

Minor justification: new public API on ThemeProvider (the dark/light boolean axis), not a fix to existing behavior.
