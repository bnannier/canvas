import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";
import { type FormSkin } from "./form.shared.js";

// Per-OS Form skins. Form is a "Light" platform treatment: ONE structure (the
// stitched rows, the optional two-column flow, the actions row) lives in
// form.shared.tsx; only small native touches shift per OS: the section-heading
// TYPE (weight, tracking) and the vertical RHYTHM (the stack gaps).
//
// Neither iOS nor Android ships a native "form" control (PLATFORM-REFERENCES.md):
//   - iOS: SwiftUI Form renders as a grouped inset list; the HIG "Entering data"
//     page is the convention reference (a touch more breathing room, SF type).
//   - Android: Material 3 has no form component; forms are composed from text
//     fields, selection controls, and buttons, so the touches follow M3 type
//     conventions (title weight, supporting-text tracking, field-density rhythm).
//   - Web: the established Canvas look (shadcn Forms), lifted VERBATIM.
//
// The interactive parts (the composed fields, the Submit/Cancel buttons) are the
// already-skinned atoms; they bring their own per-OS fidelity (shape, press
// feedback, focus), so the Form's own skin carries none.

// ---------- shared structural fragments (identical across platforms) ----------
// flex-1 vs flex-auto (the two-column item basis, base vs sm), the two-column
// gap, and the floor that keeps a two-up cell from collapsing under a squeezed
// row. These are layout, not platform-varying, so they stay shared and the shell
// imports them directly.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };
export const flexAuto: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };
export const twoColumnGap = 16;
export const twoColumnItem: ViewStyle = { minWidth: 200 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// 14/20 semibold section headings with a 12/16 muted description, a right-aligned
// actions row (gap-2, mt-2), and the gap-4 stacked rhythm.
export const webSkin: FormSkin = {
  sectionTitle: (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", color: t.foreground }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  stack: { gap: 16 },
  sectionStack: { gap: 12 },
};

// ---------- iOS (HIG "Entering data" / SwiftUI Form) ----------
// SwiftUI Form is a grouped inset list with a touch more breathing room. The
// brand survives (the indigo `primary` Submit, the foreground/muted text); only
// the SF type touches and the grouped-list rhythm change: section headings read
// as SF footnote-emphasized (13/600, tightened tracking) with a 13 secondary
// footnote description, and the stack carries the grouped-list rhythm (20).
export const iosSkin: FormSkin = {
  sectionTitle: (t: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", letterSpacing: -0.08, color: t.foreground }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  stack: { gap: 20 },
  sectionStack: { gap: 12 },
};

// ---------- Android (Material 3: text fields + selection controls + buttons) ----------
// M3 has no form component; forms are composed from M3 fields, controls, and
// buttons. The brand survives; only M3 type conventions and density change: the
// section heading takes the M3 prominent title weight (700; M3 type roles use
// 400/500/700 only) at label-large size, the description is M3 body-small
// (+0.4 tracking), and fields stack with the M3 vertical rhythm (16).
export const androidSkin: FormSkin = {
  sectionTitle: (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "700", letterSpacing: 0, color: t.foreground }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  stack: { gap: 16 },
  sectionStack: { gap: 12 },
};
