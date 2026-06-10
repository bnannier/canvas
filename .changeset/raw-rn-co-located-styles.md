---
"@olympusoss/canvas": major
---

Replace the className engine with raw React Native primitives and co-located style modules.

Canvas no longer styles components by resolving Tailwind className strings at
runtime. Every component is now built from raw React Native primitives plus a
co-located `<name>.styles.ts` whose functions build RN style objects from the
brand tokens via `useTheme()`. The flat boolean-prop API is unchanged: booleans
still select the look, they just resolve to style objects instead of class strings,
with the same per-axis precedence.

New `src/style` foundation, exported from the package barrel:

- the design tokens and the theme runtime (`ThemeProvider`, `useTheme`)
- `useResponsive` / `responsive`, reproducing the desktop-first breakpoint
  semantics (a value applies at its width and below, smallest breakpoint winning)
- the `shadow(level)` and `alpha(color, a)` style helpers
- the raw `View` / `Text` / `Pressable` / `Image` / `TextInput` / `ScrollView`
  primitives (react-native's own, re-exported for a single import)

Breaking changes:

- The primitives (`View`, `Text`, `Pressable`, `Image`, `TextInput`,
  `ScrollView`) no longer accept a `className` prop. Style them with a `style`
  object, e.g. `{ flexDirection: "row", gap: 8, color: tokens["muted-foreground"] }`.
  `ScrollView`'s `contentClassName` is gone; use `contentContainerStyle`.
- `cn`, `useStyles`, and the className resolver are removed from the package.
- A component's `className` escape-hatch prop is now a `style` prop
  (`StyleProp<ViewStyle>` / `StyleProp<TextStyle>`), applied last, for layout
  composition only.

Components used through their semantic boolean props are unaffected. Theming
(light/dark, the glass surface) is unchanged and still flows through
`ThemeProvider`.
