import type { TextStyle } from "react-native";

// The v4 hand-off's type roles (its Typography renderer, tools/v4/handoff/cv-kit-controls.js
// `TY`, and the Foundations type card) as React Native text styles: the table the
// Typography roles and every reskinned surface read their type from. Internal, not
// re-exported.
//
// Two conversions from the source, as for the legacy table below. Tracking goes from em to
// px at the style's size, and every line height is the size times the hand-off's ratio
// to a hundredth of a pixel, the browser's own value. Android needs no rounding here: its
// line-height span ceils the height in physical pixels itself (CustomLineHeightSpan). The
// face is the skin's choice (the web sets the titles in the display face), so no entry
// names a family; `mono`, `eyebrow` and `tag` are set in the mono face by the caller.
// test/v4-type-scale.test.ts derives this table from the hand-off and fails on a hand edit.
export const typeRoles = {
  display: { fontSize: 56, lineHeight: 56, fontWeight: "500", letterSpacing: -2.24 },
  h1: { fontSize: 44, lineHeight: 46.2, fontWeight: "500", letterSpacing: -1.32 },
  h2: { fontSize: 34, lineHeight: 37.4, fontWeight: "500", letterSpacing: -0.85 },
  h3: { fontSize: 26, lineHeight: 29.9, fontWeight: "500", letterSpacing: -0.52 },
  h4: { fontSize: 21, lineHeight: 25.2, fontWeight: "500", letterSpacing: -0.31 },
  h5: { fontSize: 17, lineHeight: 22.1, fontWeight: "600" },
  subheading: { fontSize: 17, lineHeight: 22.1, fontWeight: "500" },
  lead: { fontSize: 19, lineHeight: 28.5, fontWeight: "400" },
  body: { fontSize: 15, lineHeight: 23.25, fontWeight: "400" },
  label: { fontSize: 13, lineHeight: 16.9, fontWeight: "500" },
  small: { fontSize: 13, lineHeight: 19.5, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 17.4, fontWeight: "400" },
  tiny: { fontSize: 11, lineHeight: 15.95, fontWeight: "400" },
  mono: { fontSize: 13, lineHeight: 19.5, fontWeight: "400" },
  eyebrow: { fontSize: 11, lineHeight: 11, fontWeight: "500", letterSpacing: 1.1, textTransform: "uppercase" },
  tag: { fontSize: 10, lineHeight: 10, fontWeight: "600" },
  statValue: { fontSize: 32, lineHeight: 32, fontWeight: "600", letterSpacing: -0.64 },
} as const satisfies Record<string, TextStyle>;


// The hand-off pages' own text styles outside its Typography table: the page summary
// under a component page's title (Component.dc.html), a section page's tagline and lead
// (Controls.dc.html and its siblings), a component page's section heading, the Library's
// principle-card title, body and the Inputs page's panel title, a component page
// section's note, a component page's own prose (its usage paragraph and the notes
// after it), the component page's labels (its knob panel's "Props", the rail's group
// headers, the props table's header cells and the previous/next eyebrows), the
// Usage guidance card's title and paragraph, and the previous/next cards' names.
// Converted as `typeRoles` is;
// test/v4-type-scale.test.ts reads each from the page that sets it. Internal, not
// re-exported.
export const pageRoles = {
  pageLead: { fontSize: 18, lineHeight: 27.9, fontWeight: "400" },
  sectionLead: { fontSize: 17, lineHeight: 26.35, fontWeight: "400" },
  tagline: { fontSize: 22, lineHeight: 28.6, fontWeight: "400", letterSpacing: -0.33 },
  sectionTitle: { fontSize: 28, lineHeight: 30.8, fontWeight: "500", letterSpacing: -0.56 },
  cardTitle: { fontSize: 22, lineHeight: 25.3, fontWeight: "500", letterSpacing: -0.44 },
  panelTitle: { fontSize: 20, lineHeight: 24, fontWeight: "500", letterSpacing: -0.4 },
  cardBody: { fontSize: 14, lineHeight: 21.7, fontWeight: "400" },
  sectionNote: { fontSize: 14, lineHeight: 21, fontWeight: "400" },
  pageBody: { fontSize: 15, lineHeight: 24, fontWeight: "400" },
  pageNote: { fontSize: 14, lineHeight: 22.4, fontWeight: "400" },
  // The component page's label (Component.dc.html, the knob panel's "Props" label, the
  // rail's group headers, the props table's header cells and the previous/next eyebrows):
  // `font:500 11px/1 var(--fm);letter-spacing:.08em;text-transform:uppercase;color:var(--tx3)`.
  // Not the Typography table's eyebrow, which is tracked .1em and set in the accent ink.
  pageLabel: { fontSize: 11, lineHeight: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase" },
  // The Usage guidance card's title and paragraph (Component.dc.html, the `secs` cards):
  // `<h3 style="margin:0;font:600 16px/1.3 var(--ft)">` and
  // `<p style="margin:0;font:400 13.5px/1.6 var(--ft);color:var(--tx2)">`.
  guideTitle: { fontSize: 16, lineHeight: 20.8, fontWeight: "600" },
  guideBody: { fontSize: 13.5, lineHeight: 21.6, fontWeight: "400" },
  // The previous and next cards' names (Component.dc.html lines 303 and 304):
  // `<span style="font:500 18px var(--fd)">{{ prev.n }}</span>`, the display face with no
  // ratio, so the line is the browser's `normal`. Measured in Playwright on the hand-off
  // page served from tools/v4/handoff (Chromium, Bricolage Grotesque loaded):
  // getComputedStyle(span).lineHeight is "normal" and the span's line box is 22 px, for
  // both names.
  pagerName: { fontSize: 18, lineHeight: 22, fontWeight: "500" },
  // The reference sheet's cells (Component.dc.html line 238, the props table's row): the
  // type and default cells `font:400 12px/1.55 var(--fm)` (the caller sets the mono face
  // and the ink, `--tx2` for the type and `--tx3` for the default) and the description
  // cell `font:400 13px/1.55 var(--ft);color:var(--tx2)`.
  specMeta: { fontSize: 12, lineHeight: 18.6, fontWeight: "400" },
  specText: { fontSize: 13, lineHeight: 20.15, fontWeight: "400" },
} as const satisfies Record<string, TextStyle>;

/**
 * The hand-off's fluid headlines, which its pages set as `font: 500 clamp(min, N vw, max)/ratio`
 * with an em tracking: the Library and Specimen hero (`clamp(56px, 7.2vw, 112px)/.94`,
 * -.045em) and the component page title (`clamp(40px, 5vw, 64px)/1`, -.04em). `vw` is the
 * share of the window width. Internal, not re-exported; test/v4-type-scale.test.ts reads
 * each from the hand-off's pages.
 */
export interface FluidType {
  min: number;
  vw: number;
  max: number;
  ratio: number;
  trackingEm: number;
  fontWeight: "500";
}
export const fluidRoles = {
  hero: { min: 56, vw: 0.072, max: 112, ratio: 0.94, trackingEm: -0.045, fontWeight: "500" },
  pageTitle: { min: 40, vw: 0.05, max: 64, ratio: 1, trackingEm: -0.04, fontWeight: "500" },
} as const satisfies Record<string, FluidType>;

/**
 * A fluid role's type at a window `width` (0 for an unknown window, which gives the
 * minimum). The size is the clamp to a hundredth of a pixel; the line height is
 * the size times the ratio to a hundredth of a pixel (Android ceils it in physical pixels) and the
 * tracking the em value at the size.
 */
export function fluidType(spec: FluidType, width: number): TextStyle {
  const fontSize = Math.max(spec.min, Math.min(spec.max, Math.round(spec.vw * width * 100) / 100));
  return {
    fontSize,
    lineHeight: Math.round(fontSize * spec.ratio * 100) / 100,
    fontWeight: spec.fontWeight,
    letterSpacing: Math.round(spec.trackingEm * fontSize * 100) / 100,
  };
}

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

