---
"@nannier/canvas": major
---

Release Canvas 4.0.0 with the Canvas v4 “Light as material” design across the universal kit and its documentation.

This release replaces the Dark Factory appearance with the vendored v4 hand-off: authored colors and focus rings, Instrument Sans and Bricolage Grotesque typography, revised component skins, floating glass surfaces on the web, and the reference interactions and animations. The five accent palettes are violet (the default), cyan, mint, rose, and amber in both light and dark schemes; the former blush palette is removed.

The docs adopt the v4 navigation, section pages, component details, examples, and responsive chart compositions. Existing keyboard interaction, accessible names, focus management, and Reduced Motion behavior are retained.

When upgrading from v3, update `react-native-svg` to **15.8.0 or later**. Canvas 4's chart effects use its SVG filter exports; SVG 14 is no longer supported. The React and React Native minimums remain 18 and 0.74, respectively.

Activity feeds retain actor and target labels alongside their timestamps. Pagination keeps both navigation arrows available in narrow containers by using its compact presentation when the numbered row cannot fit.

Wizard follows the reference's vertical stage rail, header status, and opposing footer actions. Its default panel cap is 620 px. On the web, embedded wizards render as opaque panels without a modal backdrop; live modal wizards retain their backdrop and floating material. Compact vertical Steps and compact outlined Inputs support the reference's dense workflow layout.
