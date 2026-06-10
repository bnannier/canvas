import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Checkbox styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active brand tokens (so the box fill
// and glyph follow light/dark and the glass surface). The component resolves the
// size axis by precedence and composes these per element (row View, box View,
// glyph Text, label Text).

export type Size = "small" | "base" | "large";

// The row: box + optional label, top-aligned so a multi-line label hangs from
// the box. Press feedback (the old `active:opacity-90`) is applied by the
// component's Pressable; the disabled dim (`opacity-50`) is applied there too.
export const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
};

// Box dimensions per size (`size-*` sets width + height together).
const BOX: Record<Size, number> = {
  small: 14, // size-3.5
  base: 16, // size-4
  large: 20, // size-5
};

// The box: a square, centered, nudged down to align with the label's first line
// (`mt-0.5`), with the small 3px corner radius and a 1px border.
export const boxBase: ViewStyle = {
  marginTop: 2,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 3,
  borderWidth: 1,
};

export function boxSize(size: Size): ViewStyle {
  return { width: BOX[size], height: BOX[size] };
}

// Box fill/border: filled (checked or indeterminate) takes the primary surface;
// the empty box takes the input border on a transparent fill.
export function boxFill(tokens: ColorTokens, filled: boolean): ViewStyle {
  return filled
    ? { borderColor: tokens.primary, backgroundColor: tokens.primary }
    : { borderColor: tokens.input, backgroundColor: "transparent" };
}

// Glyph (check / dash) type per size, tuned to sit inside the box.
const GLYPH_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 }, // text-xs
  base: { fontSize: 12, lineHeight: 16 }, // text-xs
  large: { fontSize: 14, lineHeight: 20 }, // text-sm
};

// Glyph: medium weight, on the primary foreground so the tick/dash reads on the
// filled box. The per-size type sets the font size; `leading-none` then pins the
// line height to 16 (it wins over the size's own line height, mirroring the
// original class order `leading-none ... text-xs/text-sm`).
export function glyph(tokens: ColorTokens, size: Size): TextStyle {
  return {
    fontWeight: "500",
    color: tokens["primary-foreground"],
    ...GLYPH_TYPE[size],
    lineHeight: 16, // leading-none
  };
}

// Label type per size, matching the box height.
const LABEL_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 }, // text-xs
  base: { fontSize: 14, lineHeight: 20 }, // text-sm
  large: { fontSize: 16, lineHeight: 24 }, // text-base
};

// Label: medium weight on the foreground token.
export function label(tokens: ColorTokens, size: Size): TextStyle {
  return { fontWeight: "500", color: tokens.foreground, ...LABEL_TYPE[size] };
}
