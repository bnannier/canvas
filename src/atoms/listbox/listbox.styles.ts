import { type ViewStyle, type TextStyle } from "react-native";
import { surfaceRipple, shape, alpha, type ColorTokens } from "../../style/index.js";
import { hoverFill, webHover } from "../../style/hover.js";
import { primaryText } from "../../style/primary-text.js";
import { type ListboxSkin, type Size } from "./listbox.shared.js";

// The Listbox skin, drawn to the Canvas v4 hand-off (tools/v4/handoff/cv-kit-inputs.js
// `K.def('listbox')` with its code-driven items in cv-kit-code2.js). Neither iOS nor
// Material 3 has a listbox control (PLATFORM-REFERENCES.md), so every platform takes the
// hand-off's look, in its own face: the iOS and Android skins are this one object.
//
// A bordered list is the hand-off's box: the `popover` fill (its sf2) behind the
// `field-border` hairline at the tile corner, with a 4px inset; the rows are concentric
// inside it. A row is 10px in, 9px tall either side of its text (6 small, 12 large), with
// a 500 14px label (13 small) over a 400 12px detail in the subtle ink. Every chosen row,
// in single and multi select alike, sits on the accent's soft wash with a trailing 16px
// check in the accent ink; the check's slot is kept on every row so a choice never reflows
// a label. A pressed row takes the `muted` wash and, on the web, a resting row under the
// pointer the hover wash (native pointer hover waits on the owner); Android adds its
// ripple. A disabled list dims to 0.45. Listbox is an inline, in-page list (the CONTENT
// layer), so under glass the shell paints the bordered box through a CONTENT-layer
// GlassPane, and this fill is what solid mode falls back to.

// The bordered box's inset around its rows.
const INSET = 4;
// The rows, concentric inside the bordered box's inset.
const ROW_CORNER = shape.web.tile - INSET;

function containerBordered(tokens: ColorTokens): ViewStyle {
  return { borderRadius: shape.web.tile, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.border, backgroundColor: tokens.popover, padding: INSET };
}

// Each row: the label/detail stack and the trailing check. overflow:hidden clips the
// Material ripple to the rounded outline on Android.
const rowBase: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: ROW_CORNER, overflow: "hidden" };

const rowSize: Record<Size, ViewStyle> = {
  small: { paddingHorizontal: 10, paddingVertical: 6 },
  medium: { paddingHorizontal: 10, paddingVertical: 9 },
  large: { paddingHorizontal: 10, paddingVertical: 12 },
};

// The hand-off's label: 500 14px, 13px on the small list.
const LABEL_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  medium: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  large: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
};

export const webSkin: ListboxSkin = {
  containerBordered,
  rowBase,
  rowSize,
  rowGap: 0,
  rowPressed: (tokens) => ({ backgroundColor: tokens.muted }),
  rowHover: webHover((tokens: ColorTokens): ViewStyle => ({ backgroundColor: hoverFill(tokens) })),
  // The accent's soft wash under every chosen row.
  rowChosen: (tokens) => ({ backgroundColor: tokens["primary-soft"] ?? alpha(tokens.primary, 0.14) }),
  check: { size: 16, color: primaryText },
  textStack: { flexGrow: 1, flexShrink: 1, flexBasis: "0%" },
  label: (tokens, size) => ({ color: tokens.foreground, ...LABEL_TYPE[size] }),
  detail: (tokens) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  ripple: (tokens) => surfaceRipple(tokens),
  pressedOpacity: null,
  disabledOpacity: 0.45,
};

// iOS and Android ship no listbox: their skin is the hand-off's look above.
export const iosSkin: ListboxSkin = webSkin;
export const androidSkin: ListboxSkin = webSkin;
