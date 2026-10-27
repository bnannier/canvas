import type { TextStyle } from "react-native";

// The v4 hand-off's type roles (its Typography renderer, tools/v4/handoff/cv-kit-controls.js
// `TY`, and the Foundations type card) as React Native text styles: the table the
// Typography roles and every reskinned surface read their type from. Internal, not
// re-exported.
//
// Two conversions from the source, as for the legacy table below. Tracking goes from em to
// px at the style's size, and every line height is the size times the hand-off's ratio
// rounded UP to a whole pixel, because Android ceils a line height to whole pixels. The
// face is the skin's choice (the web sets the titles in the display face), so no entry
// names a family; `mono`, `eyebrow` and `tag` are set in the mono face by the caller.
// test/v4-type-scale.test.ts derives this table from the hand-off and fails on a hand edit.
export const typeRoles = {
  display: { fontSize: 56, lineHeight: 56, fontWeight: "500", letterSpacing: -2.24 },
  h1: { fontSize: 44, lineHeight: 47, fontWeight: "500", letterSpacing: -1.32 },
  h2: { fontSize: 34, lineHeight: 38, fontWeight: "500", letterSpacing: -0.85 },
  h3: { fontSize: 26, lineHeight: 30, fontWeight: "500", letterSpacing: -0.52 },
  h4: { fontSize: 21, lineHeight: 26, fontWeight: "500", letterSpacing: -0.31 },
  h5: { fontSize: 17, lineHeight: 23, fontWeight: "600" },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: "500" },
  lead: { fontSize: 19, lineHeight: 29, fontWeight: "400" },
  body: { fontSize: 15, lineHeight: 24, fontWeight: "400" },
  label: { fontSize: 13, lineHeight: 17, fontWeight: "500" },
  small: { fontSize: 13, lineHeight: 20, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "400" },
  tiny: { fontSize: 11, lineHeight: 16, fontWeight: "400" },
  mono: { fontSize: 13, lineHeight: 20, fontWeight: "400" },
  eyebrow: { fontSize: 11, lineHeight: 11, fontWeight: "500", letterSpacing: 1.1, textTransform: "uppercase" },
  tag: { fontSize: 10, lineHeight: 10, fontWeight: "600" },
  statValue: { fontSize: 32, lineHeight: 32, fontWeight: "600", letterSpacing: -0.64 },
} as const satisfies Record<string, TextStyle>;


// LEGACY: Dark Factory's named text styles, the table the surfaces not yet reskinned to
// the v4 hand-off still read (audit/v4-redesign/PLAN.md, phase 4). Each surface moves to
// `typeRoles` with its skin, and this table goes with the last of them. Internal, not
// re-exported.
//
// Two conversions from the source. Tracking goes from em to px at the style's size.
// Every line height is the size times Dark Factory's ratio rounded UP to a whole
// pixel, because Android ceils a line height to whole pixels
// (react-native CustomLineHeightSpan), so a fractional value would lay text out
// differently there than on iOS and the web. The 9.5px eyebrow and stage label take
// the kit's 10px source floor (test/design-rules-source.test.ts), the smallest label
// either platform draws.
//
// `featuredTitle` is the one style that is not in Dark Factory's scale: Argus sets its
// featured card title (20, bold, -0.01em) inline, and it is the step between the
// dialog title and the display size that the Typography h1 role needs.
export const typeScale = {
  display: { fontSize: 24, lineHeight: 27, fontWeight: "700", letterSpacing: -0.48 },
  statValue: { fontSize: 18, lineHeight: 20, fontWeight: "800", letterSpacing: -0.36 },
  metricValue: { fontSize: 18, lineHeight: 22, fontWeight: "700", letterSpacing: -0.18 },
  dialogTitle: { fontSize: 17, lineHeight: 22, fontWeight: "700", letterSpacing: -0.17 },
  drawerTitle: { fontSize: 16, lineHeight: 20, fontWeight: "700" },
  title: { fontSize: 15, lineHeight: 20, fontWeight: "700" },
  heading: { fontSize: 14, lineHeight: 19, fontWeight: "700" },
  subheading: { fontSize: 13.5, lineHeight: 18, fontWeight: "700" },
  body: { fontSize: 12.5, lineHeight: 19, fontWeight: "500" },
  bodyStrong: { fontSize: 12.5, lineHeight: 19, fontWeight: "700" },
  label: { fontSize: 12, lineHeight: 17, fontWeight: "600" },
  small: { fontSize: 11.5, lineHeight: 17, fontWeight: "600" },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: "600" },
  micro: { fontSize: 10.5, lineHeight: 14, fontWeight: "600" },
  tag: { fontSize: 10, lineHeight: 13, fontWeight: "700" },
  eyebrow: { fontSize: 10, lineHeight: 13, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase" },
  eyebrowLg: { fontSize: 10, lineHeight: 13, fontWeight: "700", letterSpacing: 1.8, textTransform: "uppercase" },
  stageLabel: { fontSize: 10, lineHeight: 13, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase" },
  featuredTitle: { fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.2 },
} as const satisfies Record<string, TextStyle>;

