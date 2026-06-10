import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Pagination styles. The page buttons, Prev/Next controls, and the
// size selector are square-ish bordered boxes whose footprint scales with the
// size axis; labels scale on a smaller type ramp. Layout-only fragments are
// static objects; anything reading a color is a function of the active tokens
// (so fills/borders follow light/dark and the glass surface).

export type Size = "small" | "default" | "large";

// Square-ish button footprint per size: height + matching min width + the
// horizontal pad (`h-8 min-w-8 px-2` / `h-9 min-w-9 px-2.5` / `h-10 min-w-10 px-3`).
export const itemSize: Record<Size, ViewStyle> = {
  small: { height: 32, minWidth: 32, paddingHorizontal: 8 },
  default: { height: 36, minWidth: 36, paddingHorizontal: 10 },
  large: { height: 40, minWidth: 40, paddingHorizontal: 12 },
};

// Label type per size (`text-xs` for small, `text-sm` otherwise).
export const labelSize: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 14, lineHeight: 20 },
};

// --- containers -------------------------------------------------------------

// Row of [prev, numbers, next] for the numbered default (`gap-1`).
export const numberedRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// Compact row: Prev/Next bracketing the "Page X of N" label (`gap-2`).
export const compactRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// With-size outer row: the selector group, the indicator, and the controls (`gap-4`).
export const withSizeRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 16 };

// The "Rows per page" label + selector cluster (`gap-2`).
export const selectorCluster: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// The Prev/Next pair inside the with-size row (`gap-1`).
export const controlPair: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// --- boxes (fill/border read tokens) ----------------------------------------

// A Prev/Next chevron control: a square bordered box on the background fill
// (`flex-row items-center justify-center rounded-md border border-input bg-background`).
export function controlBox(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
  };
}

// A numbered page button. Selected uses the primary fill/border; the rest match
// the bordered background box (`border-primary bg-primary` vs `border-input bg-background`).
export function pageBox(tokens: ColorTokens, selected: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: selected ? tokens.primary : tokens.input,
    backgroundColor: selected ? tokens.primary : tokens.background,
  };
}

// The size selector trigger: value + caret in a bordered background box with the
// pieces pushed apart (`flex-row items-center justify-between gap-1 rounded-md
// border border-input bg-background`).
export function selectorBox(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
  };
}

// --- labels -----------------------------------------------------------------

// Control glyph / numbered label color (`font-medium text-foreground`).
export function controlLabel(tokens: ColorTokens): TextStyle {
  return { fontWeight: "500", color: tokens.foreground };
}

// A numbered page label: medium weight, primary-foreground when selected
// (`font-medium` + `text-primary-foreground` / `text-foreground`).
export function pageLabel(tokens: ColorTokens, selected: boolean): TextStyle {
  return { fontWeight: "500", color: selected ? tokens["primary-foreground"] : tokens.foreground };
}

// Muted supporting text: the "Page X of N" indicator, "Rows per page", and the
// selector caret (`text-muted-foreground`).
export function mutedLabel(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

// The truncation ellipsis: muted, with a small horizontal inset (`px-1`).
export function gapLabel(tokens: ColorTokens): TextStyle {
  return { paddingHorizontal: 4, color: tokens["muted-foreground"] };
}
