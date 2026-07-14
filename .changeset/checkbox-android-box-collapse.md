---
"@nannier/canvas": patch
---

Fix the Checkbox box collapsing to a thin vertical sliver on native Android
(Fabric). A checked/indeterminate box rendered its check/dash as an in-flow
`<Text>` child, and on the New Architecture an in-flow text node drives its
parent View's main-axis size and overrode the box's explicit `width` — an 18dp
square shrank to the glyph's ~5dp measured width while the cross-axis `height`
was honored. (Radio never hit this: its checked child is a `<View>` dot, not
text.) The glyph now sits on its own absolutely-positioned, flex-centered layer,
so it is out of the box's content flow and `width` wins. The layer centers
identically on iOS, react-native-web, and native Android, so the look is
unchanged on every platform; only the collapsed Android box is fixed.
