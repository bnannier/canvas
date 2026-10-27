import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";
import { type FormSkin } from "./form.shared.js";

// The Form skin, drawn to the Canvas v4 hand-off (tools/v4/handoff/cv-kit-inputs.js
// `K.def('form')` and its code-driven form, cv-kit-code2.js `O('form')` with the
// `FormSection` it registers). One structure (the stitched rows, the optional two-column
// flow, the actions row) lives in form.shared.tsx; this is its rhythm and type.
//
// Neither iOS nor Android draws a form of its own here (PLATFORM-REFERENCES.md): SwiftUI's
// Form is a grouped inset list of its controls and Material 3 has no form component, and
// the hand-off draws the web form on both, in the platform's face. So the native builds
// alias this skin; the fields and the buttons they compose bring the platform's shapes.
//
//   Rows: a 16px rhythm, in both the stacked and the two-column flow (16 by 16).
//   Section: a 15px medium title over a 13px subtle description (line 1.5) 4 below it,
//     14 between its header and its rows and between rows, closed by an 18px inset and a
//     hairline in `border`.
//   Actions: right-aligned, 8 apart, 20 below the rows: a 14px inset over a hairline in
//     `border`. A disabled form dims to 0.5.

// ---------- shared structural fragments ----------
// flex-1 vs flex-auto (the two-column item basis, two-up vs stacked), the two-column
// gap, and the floor that keeps a two-up cell from collapsing under a squeezed row.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };
export const flexAuto: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };
export const twoColumnGap = 16;
export const twoColumnItem: ViewStyle = { minWidth: 200 };
/** A FormSection in the two-column flow takes the whole row (the hand-off's `grid-column: 1 / -1`). */
export const fullRowItem: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "100%" };

/** The hand-off's tx3: the description ink. */
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// The rows' rhythm and the room the actions row adds on top of it (20 in all).
const ROW_GAP = 16;
const ACTIONS_GAP = 20;

export const webSkin: FormSkin = {
  sectionTitle: (t: ColorTokens): TextStyle => ({ fontSize: 15, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  sectionDescription: (t: ColorTokens): TextStyle => ({ marginTop: 4, fontSize: 13, lineHeight: 19.5, fontWeight: "400", color: subtleInk(t) }),
  actions: (t: ColorTokens): ViewStyle => ({
    marginTop: ACTIONS_GAP - ROW_GAP,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: t.border,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  }),
  stack: { gap: ROW_GAP },
  section: (t: ColorTokens): ViewStyle => ({ gap: 14, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: t.border }),
  disabledOpacity: 0.5,
};

export const iosSkin: FormSkin = webSkin;
export const androidSkin: FormSkin = webSkin;
