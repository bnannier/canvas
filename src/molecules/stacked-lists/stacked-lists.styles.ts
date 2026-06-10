import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located StackedList styles. Layout-only fragments are static objects;
// anything that reads a color is a function of the active tokens (so the surface,
// dividers, and labels follow light/dark and read as glass when the
// ThemeProvider's surface is "glass", since tokens.card goes translucent there).

// --- outer frame ------------------------------------------------------------

// w-full max-w-[560px]: full width, capped at 560px.
export const outer: ViewStyle = { width: "100%", maxWidth: 560 };

// The card surface used by the `card` variant and as the optional frame when a
// title is supplied: rounded-lg border bg-card overflow-hidden shadow-sm.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    overflow: "hidden",
    ...shadow("sm"),
  };
}

// --- rows -------------------------------------------------------------------

// flex-row items-center gap-3 px-5 py-3.
export const rowBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingHorizontal: 20,
  paddingVertical: 12,
};

// border-b border-border: the hairline between ruled rows.
export function rowDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// active:bg-accent press surface (clickable rows and the overflow menu button).
export function pressedSurface(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// flex-1: the primary + secondary text column.
export const column: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// --- text -------------------------------------------------------------------

// text-sm font-medium text-foreground: the primary (name) line.
export function nameLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// text-xs text-muted-foreground: the secondary (detail) line, also the trailing
// meta text and the trailing chevron.
export function mutedLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- header -----------------------------------------------------------------

// flex-row items-center justify-between border-b border-border px-5 py-3.
export function header(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  };
}

// text-sm font-semibold text-foreground: the header title.
export function headerTitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
}

// --- add-action button ------------------------------------------------------

// flex-row items-center gap-1.5: the leading-plus + label row inside addAction.
export const addActionRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6 };

// text-xs font-medium text-foreground: the addAction button label.
export function addActionLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground };
}

// --- overflow ("...") menu --------------------------------------------------

// h-7 w-7 flex-row items-center justify-center gap-1 rounded-md bg-transparent.
export const menuButton: ViewStyle = {
  height: 28,
  width: 28,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  borderRadius: 6,
  backgroundColor: "transparent",
};

// h-1 w-1 rounded-full bg-foreground: one of the three overflow dots.
export function menuDot(tokens: ColorTokens): ViewStyle {
  return { height: 4, width: 4, borderRadius: 9999, backgroundColor: tokens.foreground };
}
