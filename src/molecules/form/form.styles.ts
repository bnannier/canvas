import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, widths } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { pageRoles } from "../../style/type-scale.js";
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
//   Aside section (`FormSection aside`, the Inputs section's Form card, Inputs.dc.html
//     `#c-form`): the heading rail beside its rows, 48 apart (the gap scale's `broad`, the
//     card's 56 is off the scale), the rail at the `xs` step (320) and the rows taking the
//     rest; in a section 512 wide or narrower (the `lg` step, Form's own two-up threshold)
//     the rail stacks over the rows, 20 apart. The title is the display face's 500 20/24
//     (the Typography `panelTitle` role), the description 400 14/21 in
//     `muted-foreground` 6 below it, the rows 18 apart. A section is 28 tall above and below
//     its rows (none above the form's first row) and closed by a hairline in `border`.
//   Actions: right-aligned, 8 apart, 20 below the rows: a 14px inset over a hairline in
//     `border`. With `hints` the row is space-between, the hints leading; after a closing
//     aside section the row drops its rule (the section's closes the form) and sits 20
//     below it. A disabled form dims to 0.5.

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

// The aside section's rail and rows (see the header).
const ASIDE_RAIL = widths.xs;
const ASIDE_ROWS_FLOOR = widths.xxxs;
const ASIDE_GUTTER = 48;
const ASIDE_STACK_GAP = 20;
const ASIDE_PAD = 28;

function skinWith(displayFace: string): FormSkin {
  return {
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
    aside: {
      section: (t, { side, first }) => ({
        flexDirection: side ? "row" : "column",
        alignItems: side ? "flex-start" : "stretch",
        gap: side ? ASIDE_GUTTER : ASIDE_STACK_GAP,
        // The form's row gap already stands above a later section, so it pads the rest.
        paddingTop: first ? 0 : ASIDE_PAD - ROW_GAP,
        paddingBottom: ASIDE_PAD,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }),
      rail: (side) => (side ? { flexBasis: ASIDE_RAIL, flexGrow: 0, flexShrink: 1, minWidth: 0 } : {}),
      rows: (side) => ({ gap: 18, ...(side ? { flexBasis: 0, flexGrow: 1, flexShrink: 1, minWidth: ASIDE_ROWS_FLOOR } : null) }),
      title: (t) => ({ ...pageRoles.panelTitle, fontFamily: displayFace, color: t.foreground }),
      description: (t) => ({ marginTop: 6, ...pageRoles.sectionNote, color: t["muted-foreground"] }),
      stackAt: widths.lg,
    },
    actionsAfterAside: { marginTop: ACTIONS_GAP - ROW_GAP, paddingTop: 0, borderTopWidth: 0 },
    actionsWithHints: { justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 12, columnGap: 16 },
    disabledOpacity: 0.5,
  };
}

/** The form: the aside title in the display face (the Typography `panelTitle` role's). */
export const webSkin: FormSkin = skinWith(DISPLAY_FONT);

export const iosSkin: FormSkin = webSkin;
export const androidSkin: FormSkin = webSkin;
