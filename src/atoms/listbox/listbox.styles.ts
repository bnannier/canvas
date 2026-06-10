import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Listbox styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the bordered surface,
// the selected/press fill, and the label/detail colors follow light/dark and the
// glass surface via tokens.popover/accent). The component resolves its mode and
// size axes and spreads these.

export type Mode = "single" | "multi";
export type Size = "small" | "medium" | "large";

// A bordered container reads as a popover surface: rounded card, hairline border,
// popover fill (translucent under glass), and a 4px inset so rows don't touch the
// edge.
export function containerBordered(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 4 };
}

// Each row: a horizontal Pressable with a leading control, the label/detail
// stack, and (added by the component) a subtle press-state fill. Size adds the
// vertical padding.
export const rowBase: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2 };

// Per-row padding by size: small reads like the legacy h-8 trigger, medium like
// h-9, large like h-10.
export const rowSize: Record<Size, ViewStyle> = {
  small: { paddingHorizontal: 8, paddingVertical: 6 },
  medium: { paddingHorizontal: 8, paddingVertical: 8 },
  large: { paddingHorizontal: 8, paddingVertical: 10 },
};

// The accent fill used for a selected single-select row and the press state.
export function rowSelected(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Single-select checkmark column: a fixed-width gutter reserved on every row so
// labels stay aligned whether or not the row is selected.
export function checkmark(tokens: ColorTokens): TextStyle {
  return { width: 16, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The label/detail stack grows to fill the remaining row width.
export const textStack: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Label type per size (small is smaller; medium and large share the body size).
const LABEL_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  medium: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 14, lineHeight: 20 },
};

export function label(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens.foreground, ...LABEL_TYPE[size] };
}

export function detail(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}
