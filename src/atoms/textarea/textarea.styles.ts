import { destructiveText } from "../../style/destructive-text.js";
import { fieldBorder, fieldErrorFill } from "../../style/field-colors.js";
import { typeRoles } from "../../style/type-scale.js";
import { type TextStyle, type ViewStyle } from "react-native";
import { type ColorTokens, MONO_FONT, TERMINAL_FONT, activeIndicator, shape, tabularNums, type FloatingLabelStyles } from "../../style/index.js";
import { webSkin as inputWeb } from "../input/input.styles.js";

// Co-located Textarea skins, one per platform, drawn to the Canvas v4 hand-off
// (tools/v4/handoff/cv-kit-inputs.js `K.def('textarea')`, its iOS and Android rows
// `P.textarea` in cv-kit-platform.js, and the flush override in cv-kit-code2.js and
// cv-kit-code6.js). A multiline text field is a job iOS and Android both ship a control
// for (UITextView in a field box, the M3 filled multiline field), so both keep their
// native shape; the web takes the hand-off's sunken well. The field is a multiline
// TextInput, so every fragment is a TextStyle. The BRAND survives on every platform
// (the focus cue is the `ring` token, the cursor and selection `primary`, the error cue
// `destructive`), and the box is the single-line Input's on each platform, so a
// Textarea under an Input reads as one family:
//   Web: the sunken well (`surface-sunken`) at the web field corner with a 1px
//     `field-border` hairline, a 10px by 12px inset, the 400 value at 13/14/16px with a
//     1.55 line, and rows x 22px (25px large) + 20 of minimum height (4 rows by default).
//     Hover steps the hairline to `subtle-foreground`; focus paints the `ring` edge and
//     the 4px accent halo (the hand-off draws the accent halo on an errored field too);
//     error is the `destructive` edge. The label above is the 500 13px `label` role in
//     `muted-foreground`, 6px over the field; the count is 400 11px mono in the subtle
//     ink, end-aligned 6px under it ("4 / 280"). Disabled dims to 0.45. Flush drops the
//     frame and the fill for a 12px by 14px inset.
//   iOS: a `card` box at the iOS field corner, a 1pt state border (error > focus >
//     `field-border`), a 10pt by 12pt inset, the 16pt value (13/16 small, 17/26 large)
//     and rows x the line + 20 of minimum height; error washes the box. The label above
//     is the 14pt regular secondary title 8pt over the field; the count is 13pt in the
//     subtle ink with tabular figures ("4/280"), 8pt under it. Disabled dims to 0.5.
//   Android (Material 3 filled): a `muted` fill, the M3 field corner on top and a flat
//     bottom, a bottom active indicator (1dp `muted-foreground` -> 2dp `ring` on focus,
//     `destructive` on error) inside a constant 10dp band, a 16dp side inset, 8dp over
//     the in-container floating label, body-large type (14/20, 16/24, 18/26) and rows x
//     the line + 34 of minimum height. The count sits at the end of the supporting-text
//     row (12/16, 0.4 tracking, `muted-foreground`, "4 / 280"), 4dp under the field and
//     16dp in. Disabled dims to 0.38.

export type Size = "small" | "base" | "large";

// State the shell resolves and hands to the skin's field builder.
export interface TextareaFieldState {
  /** Error/validation state (error or invalid prop). */
  error: boolean;
  /** The field currently holds keyboard focus. */
  focused: boolean;
  /** A pointer rests over the field (web only; the skin declares `hover`). */
  hovered?: boolean;
}

// The field surface for a given state, plus the label-placement slice contributed
// by FloatingLabelStyles<Size> (iOS/web render the label ABOVE via `labelAbove`;
// Android FLOATS the M3 in-container label via `labelRest`/`labelFloated`/
// `labelReserve`, a MULTILINE float pinned to the top text line).
export interface TextareaSkin extends FloatingLabelStyles<Size> {
  /** Clear Liquid Glass text entry on the web appearance. */
  liquid?: boolean;
  referenceLabel?: boolean;
  /** The above-field label's whole type and ink: every skin supplies it, Android's too,
   *  for the flush field, which never floats its label. */
  labelAbove: NonNullable<FloatingLabelStyles<Size>["labelAbove"]>;
  field: (tokens: ColorTokens, state: TextareaFieldState) => TextStyle;
  /** The value's type scale per size. */
  text: (size: Size) => TextStyle;
  /** The field's minimum height for a row count (the field still grows with content). */
  minHeight: (rows: number | undefined, size: Size) => TextStyle;
  /** Whether a pointer hover steps the resting edge to `subtle-foreground` (web only;
   *  native pointer hover waits on the owner, src/style/hover.tsx). */
  hover?: boolean;
  /** The halo around a focused field (a box-shadow spread), or absent for none. */
  focusHalo?: (tokens: ColorTokens) => ViewStyle;
  /** What a flush field keeps of its inset once its frame drops (absent: the framed inset). */
  flushInset?: TextStyle;
  /** The placeholder ink. */
  placeholder: (tokens: ColorTokens) => string;
  /** Opacity applied to the field and its label when disabled. */
  disabledOpacity: number;
  /** The gap between the above-field label and the field. */
  labelGap: number;
  /** The leading inset the Android floating label aligns with (the field's side inset). */
  labelInset?: number;
  /**
   * The live character-count line the component renders under the field when
   * `showCount` is set (end-aligned, "N / max"). The subtle or muted caption at rest,
   * `destructive-text` once the count passes the soft cap so the overage reads as an
   * error. Only the type conventions change per OS.
   */
  count: (tokens: ColorTokens, over: boolean) => TextStyle;
  /** The count row's own place under the field: its gap from the field and any side inset. */
  countRow: { gap: number; inset: number };
  /** What joins the count to its cap: " / " (web, Android) or "/" (iOS). */
  countJoin: string;
}

// The subtle ink: the hand-off's tx3 (the placeholder, the web and iOS count).
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// Rows the field sizes to when the caller passes none: the hand-off's 4. The count is
// clamped to at least one whole visible row, so rows={0} or a negative/fractional value
// can never collapse the field below a usable single-line floor.
const DEFAULT_ROWS = 4;
function rowsOf(rows: number | undefined): number {
  return rows == null ? DEFAULT_ROWS : Math.max(1, Math.floor(rows));
}

// ---------- Web: the hand-off's sunken well ----------
const WEB_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 20.15, fontWeight: "400" },
  base: { fontSize: 14, lineHeight: 21.7, fontWeight: "400" },
  large: { fontSize: 16, lineHeight: 24.8, fontWeight: "400" },
};

export const webSkin: TextareaSkin = {
  liquid: true,
  referenceLabel: true,
  field: (t, st) => ({
    width: "100%",
    borderRadius: shape.web.field,
    borderWidth: 1,
    borderColor: st.error ? t.destructive : st.focused ? t.ring : st.hovered ? subtleInk(t) : fieldBorder(t),
    backgroundColor: t["surface-sunken"] ?? t["field-fill"] ?? t.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: t.foreground,
  }),
  text: (size) => WEB_TEXT[size],
  minHeight: (rows, size) => ({ minHeight: rowsOf(rows) * (size === "large" ? 25 : 22) + 20 }),
  hover: true,
  // The Input's accent halo: the hand-off draws it on every focused textarea, errored or not.
  focusHalo: (t) => inputWeb.focusHalo!(t, false) ?? {},
  flushInset: { paddingHorizontal: 14, paddingVertical: 12 },
  placeholder: subtleInk,
  disabledOpacity: 0.45,
  labelGap: 6,
  // The label sits ABOVE the field: the 500 13px `label` role, muted, as the Input's.
  floatingLabel: false,
  labelAbove: (t) => ({ ...typeRoles.label, color: t["muted-foreground"] }),
  count: (t, over) => ({ fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", color: over ? destructiveText(t) : subtleInk(t) }),
  countRow: { gap: 6, inset: 0 },
  countJoin: " / ",
};

// ---------- iOS: the hand-off's iOS field box, multiline ----------
const IOS_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 16 },
  base: { fontSize: 16, lineHeight: 24 },
  large: { fontSize: 17, lineHeight: 26 },
};
const IOS_LABEL: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  base: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};

export const iosSkin: TextareaSkin = {
  field: (t, st) => ({
    width: "100%",
    borderRadius: shape.ios.field,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: st.error ? t.destructive : st.focused ? t.ring : fieldBorder(t),
    backgroundColor: st.error ? fieldErrorFill(t) : t.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: t.foreground,
  }),
  text: (size) => IOS_TEXT[size],
  minHeight: (rows, size) => ({ minHeight: rowsOf(rows) * (IOS_TEXT[size].lineHeight as number) + 20 }),
  placeholder: subtleInk,
  disabledOpacity: 0.5,
  labelGap: 8,
  // The label sits ABOVE the field: the 14pt regular secondary title with SF Pro Text's
  // tracking (-0.15), mirroring the single-line Input.
  floatingLabel: false,
  labelAbove: (t, size) => ({ ...IOS_LABEL[size], fontWeight: "400", letterSpacing: -0.15, color: t["muted-foreground"] }),
  count: (t, over) => ({ ...tabularNums(), fontSize: 13, lineHeight: 18, fontWeight: "400", color: over ? destructiveText(t) : subtleInk(t) }),
  countRow: { gap: 8, inset: 0 },
  countJoin: "/",
};

// ---------- Android (Material 3 filled): muted fill + active indicator ----------
// M3 body-large per size: the value, and the label at rest (it reads as the placeholder
// it replaces until it floats to body-small).
const ANDROID_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  base: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  large: { fontSize: 18, lineHeight: 26, letterSpacing: 0.5 },
};
const ANDROID_INSET = 16;

export const androidSkin: TextareaSkin = {
  field: (t, st) => ({
    width: "100%",
    borderTopStartRadius: shape.android.field,
    borderTopEndRadius: shape.android.field,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    backgroundColor: t.muted,
    // The active indicator inside the hand-off's 10dp bottom band: 1dp at rest, 2dp when
    // active, the rest of the band padding, so the thickening never reflows the text.
    ...activeIndicator({ active: st.focused || st.error, restColor: t["muted-foreground"], activeColor: st.error ? t.destructive : t.ring, gap: 8 }),
    paddingHorizontal: ANDROID_INSET,
    paddingTop: 8,
    color: t.foreground,
  }),
  text: (size) => ANDROID_TEXT[size],
  minHeight: (rows, size) => ({ minHeight: rowsOf(rows) * (ANDROID_TEXT[size].lineHeight as number) + 34 }),
  // The hand-off's tx3 placeholder is about 4.2:1 on the dark `muted` fill, so the M3
  // field keeps `muted-foreground`, as the Input's does.
  placeholder: (t) => t["muted-foreground"],
  disabledOpacity: 0.38,
  labelGap: 6,
  labelInset: ANDROID_INSET,
  // Android (Material 3): the IN-CONTAINER FLOATING label, pinned to the TOP text line
  // (the value is top-aligned). At rest it sits on the first line at the value's type;
  // once the field is focused or filled it floats to body-small, and the value starts
  // below it: the 8dp top inset plus the 16dp floated line.
  floatingLabel: true,
  labelRest: (_t, size) => ANDROID_TEXT[size],
  labelFloated: (_t, _size) => ({ fontSize: 12, lineHeight: 16, letterSpacing: 0.4 }),
  labelReserve: (_size) => ({ paddingTop: 24 }),
  // A flush field drops its frame inside a toolbar Card, so its label never floats: it
  // is a foreground title above the field at the resting type, medium weight.
  labelAbove: (t, size) => ({ ...ANDROID_TEXT[size], fontWeight: "500", color: t.foreground }),
  // M3 supporting text (body-small 12/16, 0.4 tracking), on-surface-variant, turning
  // destructive once the count passes the soft cap.
  count: (t, over) => ({ ...tabularNums(), fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: over ? destructiveText(t) : t["muted-foreground"] }),
  countRow: { gap: 4, inset: ANDROID_INSET },
  countJoin: " / ",
};

/** Dense paragraph entry shares Argus Input's inset and semibold values. */
export const denseText: TextStyle = { fontSize: 13, lineHeight: 19.5, fontWeight: "600" };
export const denseField = (tokens: ColorTokens): TextStyle => ({ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: tokens["field-fill"] ?? tokens.card });
export const denseMinHeight = (rows?: number): TextStyle => ({ minHeight: 20 + Math.max(1, Math.floor(rows ?? 2)) * 19.5 });

/** Terminal prompts share transcript metrics without borrowing a platform field inset. */
export const terminalText: TextStyle = { fontFamily: TERMINAL_FONT, fontSize: 13, lineHeight: 20, fontWeight: "400" };
export const terminalField: TextStyle = { paddingHorizontal: 0, paddingVertical: 0, paddingTop: 0, paddingBottom: 0, paddingStart: 0, paddingEnd: 0 };
export const terminalMinHeight = (rows?: number): TextStyle => ({ minHeight: Math.max(1, Math.floor(rows ?? 1)) * 20 });
