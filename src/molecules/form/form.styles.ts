import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";
import { type FormSkin } from "./form.shared.js";

// Per-OS Form skins. Form is a "Light" platform treatment: ONE structure and one
// set of (semantic) colors live in form.shared.tsx; only small native touches shift
// per OS: the label/helper TYPE (weight, tracking), the vertical RHYTHM (the stack
// gaps and the label inset above its input), and the section-divider spacing.
//
// Neither iOS nor Android ships a native "form" control (PLATFORM-REFERENCES.md):
//   - iOS: SwiftUI Form renders as a grouped inset list; the HIG "Entering data"
//     page is the convention reference (label above input, secondary/footnote
//     helper text below, a touch more breathing room).
//   - Android: Material 3 has no form component; forms are composed from text
//     fields, selection controls, and buttons, so the touches follow M3 type
//     conventions (positive label/body tracking, supporting-text rhythm).
//   - Web: the established Canvas look (shadcn Forms), lifted VERBATIM.
//
// The interactive parts (Submit/Cancel buttons, checkbox rows) are the already-
// skinned Button and Checkbox atoms; they bring their own per-OS press feedback
// (Android ripple, iOS/web opacity dim), so the Form's own skin carries none.

// ---------- shared structural fragments (identical across platforms) ----------
// flex-1 vs flex-auto (the two-column item basis, base vs sm). These are layout,
// not platform-varying, so they stay shared and the shell imports them directly.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };
export const flexAuto: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current Form: medium (500) 14/20 labels, a 6px inset above each input, 12/16
// muted helper + section description, a 1px section divider with 24 below, a
// right-aligned actions row (gap-2, mt-2), and the gap-4 / gap-6 outer stacks.
export const webSkin: FormSkin = {
  label: (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  helper: (t: ColorTokens): TextStyle => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  sectionDivider: (t: ColorTokens): ViewStyle => ({ borderBottomWidth: 1, borderColor: t.border, paddingBottom: 24 }),
  labelSpacing: { marginBottom: 6 },
  headingWeight: { fontWeight: "600" },
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  stackGap4: { gap: 16 },
  stackGap6: { gap: 24 },
  checkboxRow: {},
};

// ---------- iOS (HIG "Entering data" / SwiftUI Form) ----------
// SwiftUI Form is a grouped inset list: label above input, a secondary/footnote
// helper below, with a touch more breathing room. The brand survives (the indigo
// `primary` Submit, the `foreground`/`muted-foreground` text); only the SF type
// touches and the grouped-list rhythm change. SF labels read at 13/600 (semibold
// footnote-emphasis) with tightened tracking; the helper is a 13 secondary
// footnote; the field inset above the input is a touch larger (8) and the outer
// stacks carry the grouped-list rhythm (20 / 28).
export const iosSkin: FormSkin = {
  label: (t: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", letterSpacing: -0.08, color: t.foreground }),
  helper: (t: ColorTokens): TextStyle => ({ marginTop: 6, fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  sectionDivider: (t: ColorTokens): ViewStyle => ({ borderBottomWidth: 1, borderColor: t.border, paddingBottom: 24 }),
  labelSpacing: { marginBottom: 8 },
  // Section/sidebar heading = SF footnote-emphasized (600); 13/700 matches no SF role.
  headingWeight: { fontWeight: "600" },
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  stackGap4: { gap: 20 },
  stackGap6: { gap: 28 },
  // HIG minimum touch target 44x44pt; SwiftUI Form toggle/check rows are 44pt list
  // rows. The checkbox row is a flex ROW, so alignItems (cross axis) centers it.
  checkboxRow: { minHeight: 44, alignItems: "center" },
};

// ---------- Android (Material 3: text fields + selection controls + buttons) ----------
// M3 has no form component; forms are composed from M3 fields, controls, and
// buttons. The brand survives; only M3 type conventions and density change. M3
// labels read at label-large (14sp / 500 / 0 tracking); supporting (helper) text
// is M3 body-small (12sp / +0.4 tracking) inset 16dp to align with the field text;
// fields stack with the M3 vertical rhythm (16 / 24, matching the field-density
// spacing). The section heading bumps to the M3 prominent title weight (700; M3
// type roles use 400/500/700 only).
export const androidSkin: FormSkin = {
  // Field label = M3 label-large: 14sp / 20 line / 500 weight / 0 tracking (the prior
  // +0.25 crossed label-large's weight with body-medium's tracking, matching no role).
  label: (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0, color: t.foreground }),
  // M3 supporting text: body-small inset 16dp to align with the field text, 4dp below.
  helper: (t: ColorTokens): TextStyle => ({ marginTop: 4, paddingHorizontal: 16, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  sectionDivider: (t: ColorTokens): ViewStyle => ({ borderBottomWidth: 1, borderColor: t.border, paddingBottom: 24 }),
  labelSpacing: { marginBottom: 6 },
  // Section/sidebar heading = M3 prominent title weight (700); 600 is not an M3
  // type-scale weight (M3 uses 400/500/700 only).
  headingWeight: { fontWeight: "700" },
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  stackGap4: { gap: 16 },
  stackGap6: { gap: 24 },
  // M3 minimum touch target 48x48dp; selection-control rows reserve a 48dp target.
  checkboxRow: { minHeight: 48, alignItems: "center" },
};
