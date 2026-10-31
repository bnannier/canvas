---
"@nannier/canvas": major
---

Release Canvas 4.0.0 with the Canvas v4 “Light as material” design across the universal kit and its documentation.

The owner explicitly authorized this major release: “lets release canvas 4” (2026-10-30), following the earlier “bump to 4.0.0” decision.

This release replaces the Dark Factory appearance with the vendored v4 hand-off: authored colors and focus rings, Instrument Sans and Bricolage Grotesque typography, revised component skins, floating glass surfaces on the web, and the reference interactions and animations. The five accent palettes are violet (the default), cyan, mint, rose, and amber in both light and dark schemes; the former blush palette is removed.

The docs adopt the v4 navigation, section pages, component details, examples, and responsive chart compositions. Existing keyboard interaction, accessible names, focus management, and Reduced Motion behavior are retained.

When upgrading from v3, update `react-native-svg` to **15.8.0 or later**. Canvas 4's chart effects use its SVG filter exports; SVG 14 is no longer supported. The React and React Native minimums remain 18 and 0.74, respectively.

Activity feeds retain actor and target labels alongside their timestamps. Pagination keeps both navigation arrows available in narrow containers by using its compact presentation when the numbered row cannot fit.
