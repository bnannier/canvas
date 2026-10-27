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
// The two-column flow is the hand-off's grid (cv-kit-code2.js `O('form')`:
// `grid-template-columns: 1fr 1fr; gap: 16px`, a FormSection `grid-column: 1 / -1`), built
// from flex: a wrapping row of half-width cells, so exactly two sit on a line however wide
// the form is, and an odd last field keeps its half instead of stretching across. The
// 16px gutter is the two cells' 8px inner insets (paddingEnd on the start cell,
// paddingStart on the end cell, so it mirrors under RTL), and the 16px between lines is the
// row gap. Below the threshold the cells stack in one column at the same 16px rhythm, each
// stretched to the form's width, so a field FILLs it.
export const twoColumnGap = 16;
/** The two-up rows: a wrapping row, 16 between lines; the cells carry the column gutter. */
export const twoUpRows: ViewStyle = { flexDirection: "row", flexWrap: "wrap", rowGap: twoColumnGap };
/** The stacked rows below the threshold: one column, 16 apart, every cell the form's width. */
export const stackedRows: ViewStyle = { flexDirection: "column", gap: twoColumnGap };
/** A field in the start column of the two-up flow. */
export const startCell: ViewStyle = { width: "50%", paddingEnd: twoColumnGap / 2 };
/** A field in the end column of the two-up flow. */
export const endCell: ViewStyle = { width: "50%", paddingStart: twoColumnGap / 2 };
/** A FormSection in the two-up flow takes the whole line (the hand-off's `grid-column: 1 / -1`). */
export const fullRowCell: ViewStyle = { flexBasis: "100%", flexGrow: 1, flexShrink: 1 };
/** A cell in the stacked flow: stretched to the column (the default), nothing else. */
export const stackedCell: ViewStyle = {};

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
