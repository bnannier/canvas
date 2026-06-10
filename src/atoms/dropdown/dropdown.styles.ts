import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow } from "../../style/index.js";

// Co-located Dropdown styles. The menu is a popover-surfaced card; rows are
// pressable item layouts. Layout-only fragments are static objects; anything
// reading a color is a function of the active tokens (so the menu follows
// light/dark and reads as glass when tokens.popover is swapped translucent at
// the theming level). There are no visual style axes on the menu, so there is
// no per-axis precedence here; the only color branch is a row's `destructive`
// flag, which goes through the Tailwind palette with a dark: swap.

// --- wrapper + trigger ------------------------------------------------------

// self-start keeps the trigger from stretching; relative anchors the menu.
export const wrapper: ViewStyle = { position: "relative", alignSelf: "flex-start" };

// The custom-trigger Pressable: keeps the chip from stretching.
export const customTrigger: ViewStyle = { alignSelf: "flex-start" };

// --- menu card --------------------------------------------------------------

// The floating menu: a popover card (rounded-md border bg-popover p-1 shadow-lg)
// positioned absolutely below the trigger (absolute top-full left-0 z-50 mt-1).
// The component supplies the measured minWidth inline.
export function menuCard(tokens: ColorTokens): ViewStyle {
  return {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 50,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    padding: 4,
    ...shadow("lg"),
  };
}

// Muted section heading rendered above the rows.
export function menuLabel(tokens: ColorTokens): TextStyle {
  return {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: tokens["muted-foreground"],
  };
}

// --- item rows --------------------------------------------------------------

// The item row layout (flex-row items-center gap-2 rounded-sm px-2 py-1.5). The
// press state (active:bg-accent) is applied by the row's Pressable callback.
export const itemRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  borderRadius: 2,
  paddingHorizontal: 8,
  paddingVertical: 6,
};

// The pressed fill (active:bg-accent).
export function itemPressed(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Hairline separator above a row that starts a new group (my-1 h-px bg-border).
export function separator(tokens: ColorTokens): ViewStyle {
  return { marginTop: 4, marginBottom: 4, height: 1, backgroundColor: tokens.border };
}

// Item icon glyph and label share the text-sm scale; color branches on
// `destructive` (text-red-600 dark:text-red-400) vs. the popover foreground.
export const itemTextType: TextStyle = { fontSize: 14, lineHeight: 20 };

export function itemTextColor(tokens: ColorTokens, dark: boolean, destructive: boolean): TextStyle {
  if (destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
  return { color: tokens["popover-foreground"] };
}

// Trailing keyboard shortcut, right-aligned and muted (ml-auto text-xs
// tracking-widest text-muted-foreground).
export function shortcut(tokens: ColorTokens): TextStyle {
  return {
    marginLeft: "auto",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    color: tokens["muted-foreground"],
  };
}
