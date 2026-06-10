import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Combobox styles. Layout-only parts are static objects; anything
// that reads a color is a function of the active tokens (so the field, popover,
// and option rows follow light/dark, and the popover reads as glass when the
// ThemeProvider's surface is "glass", since tokens.popover is swapped
// translucent at the theming level). The size axis is resolved by the component
// (small > large > default) and passed in as a key.

export type Size = "small" | "default" | "large";

// Field height per size; mirrors the Input control's footprint (h-8/h-9/h-10).
const FIELD_BOX: Record<Size, number> = { small: 32, default: 36, large: 40 };

// Type scale per size, shared by the field text and the option rows.
const TEXT_SIZE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};

// The size's shared type scale (text-xs/text-sm/text-base).
export function textSize(size: Size): TextStyle {
  return TEXT_SIZE[size];
}

// --- outer wrapper ----------------------------------------------------------

// `relative w-full`: the positioning context for the absolutely-placed popover.
export const wrapper: ViewStyle = { position: "relative", width: "100%" };

// --- label ------------------------------------------------------------------

// `mb-1.5 font-medium text-foreground` + the size type scale.
export function label(tokens: ColorTokens, size: Size): TextStyle {
  return { marginBottom: 6, fontWeight: "500", color: tokens.foreground, ...TEXT_SIZE[size] };
}

// --- field ------------------------------------------------------------------

// `flex-row items-center justify-between rounded-md border border-input
// bg-background px-3` + the per-size height (h-8/h-9/h-10).
export function field(tokens: ColorTokens, size: Size): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
    paddingHorizontal: 12,
    height: FIELD_BOX[size],
  };
}

// Field value text: foreground when it shows a query/value, muted for the
// placeholder (`text-foreground` vs `text-muted-foreground`), at the size scale.
export function fieldText(tokens: ColorTokens, size: Size, muted: boolean): TextStyle {
  return { color: muted ? tokens["muted-foreground"] : tokens.foreground, ...TEXT_SIZE[size] };
}

// The trailing chevron: `text-muted-foreground` + the size scale.
export function chevron(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens["muted-foreground"], ...TEXT_SIZE[size] };
}

// --- popover (open option list) ---------------------------------------------

// `absolute top-full left-0 right-0 z-50 mt-1 max-h-[240px] rounded-md border
// border-border bg-popover p-1 shadow-lg`.
export function popover(tokens: ColorTokens): ViewStyle {
  return {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: 4,
    maxHeight: 240,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    padding: 4,
    ...shadow("lg"),
  };
}

// --- empty state ------------------------------------------------------------

// The "No results" row box: `px-2 py-1.5`.
export const emptyRow: ViewStyle = { paddingHorizontal: 8, paddingVertical: 6 };

// The "No results" label: `text-muted-foreground` at the size scale.
export function emptyText(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens["muted-foreground"], ...TEXT_SIZE[size] };
}

// --- option rows ------------------------------------------------------------

// `flex-row items-center gap-2 rounded-sm px-2 py-1.5`; the `active:bg-accent`
// press fill and the `selected && bg-accent` fill are layered by the component.
export const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  borderRadius: 2,
  paddingHorizontal: 8,
  paddingVertical: 6,
};

// The accent surface used for both the selected row and the pressed row
// (`bg-accent` / `active:bg-accent`).
export function rowAccent(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// The leading check column (`text-popover-foreground`); fixed 14px width keeps
// the labels aligned whether or not a row is selected.
export function check(tokens: ColorTokens, size: Size): TextStyle {
  return { width: 14, color: tokens["popover-foreground"], ...TEXT_SIZE[size] };
}

// The option label (`text-popover-foreground`) at the size scale.
export function optionText(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens["popover-foreground"], ...TEXT_SIZE[size] };
}

// --- helper text ------------------------------------------------------------

// `mt-1.5 text-xs text-muted-foreground`.
export function helper(tokens: ColorTokens): TextStyle {
  return { marginTop: 6, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}
