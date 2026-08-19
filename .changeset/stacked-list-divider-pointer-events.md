---
"@nannier/canvas": patch
---

StackedList: the row divider takes `pointerEvents` from a style rather than the
deprecated prop.

The hairline between ruled rows was rendered as `<View pointerEvents="none">`.
React Native has deprecated that prop in favour of `style.pointerEvents`, so
every render of a ruled list logged "props.pointerEvents is deprecated. Use
style.pointerEvents", including once per run of the kit's own console gate in
`test/no-console-violations.test.tsx`.

The declaration now comes from a module-level `StyleSheet.create`, composed onto
the divider alongside the skin's hairline style. That is the kit's existing
convention for this property (see `src/charts/shared/chart-inspect.tsx` and
`src/organisms/toast/toast.shared.tsx`): react-native-web compiles
`pointerEvents` into an atomic class only from a registered stylesheet entry and
silently drops it from an inline style literal, so the registered form is the one
that keeps the hairline inert to touch on web.

Behaviour is unchanged on every platform. The divider still carries
pointer-events none, verified in the rendered web output.
