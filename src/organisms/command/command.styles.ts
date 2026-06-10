import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Command styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the palette follows
// light/dark, and the popover surface reads as glass when the ThemeProvider's
// surface is "glass", since tokens.popover is swapped translucent at the theming
// level). The active-row highlight and the row press state both use the accent
// token: the highlight is composed in the component, the press state in the
// Pressable's style callback.

// --- card shell -------------------------------------------------------------

// The floating palette card: fixed width, rounded, bordered, raised, clipping
// its rounded corners. (w-[420px] rounded-lg border border-border bg-popover
// shadow-xl overflow-hidden.)
export function card(tokens: ColorTokens): ViewStyle {
  return {
    width: 420,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    overflow: "hidden",
    ...shadow("xl"),
  };
}

// In trigger mode the card floats below the collapsed trigger button.
// (absolute top-full left-0 z-50 mt-3.)
export const cardFloating: ViewStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  zIndex: 50,
  marginTop: 12,
};

// --- search row -------------------------------------------------------------

// The search row at the top of the card: a leading glyph + the muted
// placeholder, with a hairline under it.
// (flex-row items-center gap-2 border-b border-border px-3 py-3.)
export function searchRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  };
}

// The magnifier glyph in the search row. (text-sm text-muted-foreground.)
export function searchGlyph(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The muted placeholder text in the search row. (text-sm text-muted-foreground.)
export function searchPlaceholder(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// --- result groups + rows ---------------------------------------------------

// The optional uppercase section heading above a group's rows.
// (uppercase text-xs text-muted-foreground px-3 pt-3 pb-1.)
export function groupHeading(tokens: ColorTokens): TextStyle {
  return {
    textTransform: "uppercase",
    fontSize: 12,
    lineHeight: 16,
    color: tokens["muted-foreground"],
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  };
}

// A result row: leading icon + label + optional trailing shortcut.
// (flex-row items-center gap-3 px-3 py-2; active:bg-accent is the press state.)
export const rowBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
};

// The accent surface: used for both the highlighted (active) row and the row
// press state (active:bg-accent). (bg-accent.)
export function rowAccent(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// A row's leading glyph. (text-sm text-foreground.)
export function rowIcon(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens.foreground };
}

// A row's label, taking the remaining width. (text-sm text-foreground flex-1.)
export function rowLabel(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.foreground,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  };
}

// --- collapsed trigger ------------------------------------------------------

// The wrapper around the collapsed trigger + the floating card.
// (relative w-full.)
export const triggerWrapper: ViewStyle = { position: "relative", width: "100%" };

// The collapsed full-width search trigger button.
// (flex-row items-center gap-2 w-full justify-start rounded-md border
//  border-input bg-transparent px-3 py-1.5.)
export function triggerRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
  };
}

// The trigger button's "Search..." label. (text-sm text-foreground.)
export function triggerLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens.foreground };
}

// Pushes the trailing kbd cap to the right edge of the trigger. (ml-auto.)
export const triggerKbd: ViewStyle = { marginLeft: "auto" };

// --- footer hint bar --------------------------------------------------------

// The footer hint bar below the list. (flex-row items-center gap-3 border-t
// border-border px-4 py-2.5.)
export function footerBar(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  };
}

// A single hint cluster in the footer (kbd cap(s) + its text).
// (flex-row items-center gap-1.)
export const footerHint: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// A hint's supporting text. (text-xs text-muted-foreground.)
export function footerText(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}
