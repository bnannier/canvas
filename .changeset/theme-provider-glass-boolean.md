---
"@nannier/canvas": minor
---

ThemeProvider speaks the surface mode in boolean grammar: `<ThemeProvider glass>`

The one string-valued switch left on the provider joins the kit's semantic
boolean axis convention. `glass` forces the translucent functional layer on,
`solid` forces the flat look, and passing neither keeps the platform default
(glass on iOS 26+, solid everywhere else). Axis first-match: `glass` wins over
`solid`, and both win over the legacy prop.

This is the minor's user-visible capability: a new public prop pair on
`ThemeProvider`, making the provider's call-site grammar match every component
axis (`<ThemeProvider scheme="dark" glass>` beside `<Button primary large>`).

`surface="solid" | "glass"` remains supported unchanged, for back-compat and for
config-driven code that already holds a `Surface` value; the resolved value the
theme context carries (`useTheme().surface`) and the web DOM helper
(`setSurface("glass")`) are untouched.
