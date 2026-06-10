import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow } from "../../style/index.js";

// Co-located RowMenu styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the popover surface,
// hairlines, and label follow light/dark, and the card reads as glass when the
// ThemeProvider's surface is "glass", since tokens.popover is swapped translucent
// at the theming level). The destructive row color branches on the dark scheme
// (a fixed Tailwind palette hue), so it takes `dark` as well.

export interface RowMenuItem {
  label: string;
  /** Optional leading glyph rendered before the label (a single character). */
  icon?: string;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
}

// --- trigger ----------------------------------------------------------------

// The ⋯ icon-button: a 32x32 square, centered, with the menu radius. The press
// fill (the old `active:bg-accent`) is applied by the component's Pressable.
export const trigger: ViewStyle = {
  width: 32,
  height: 32,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};

// `text-base text-foreground` for the ⋯ glyph.
export function triggerGlyph(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, color: tokens.foreground };
}

// --- outer anchor -----------------------------------------------------------

// `relative self-start`: anchors the floating menu and keeps the trigger from
// stretching to fill its parent.
export const anchor: ViewStyle = { position: "relative", alignSelf: "flex-start" };

// --- menu card --------------------------------------------------------------

// `min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg`, plus
// the inline floating placement `absolute top-full left-0 z-50 mt-1`. The popover
// fill + border go translucent under glass.
export function menuCard(tokens: ColorTokens): ViewStyle {
  return {
    minWidth: 180,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    padding: 4,
    ...shadow("lg"),
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 50,
    marginTop: 4,
  };
}

// `px-2 py-1.5 text-xs font-medium text-muted-foreground`: the muted section
// heading above the rows.
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

// --- rows -------------------------------------------------------------------

// `flex-row items-center gap-2 rounded-sm px-2 py-1.5`: a single action/link row.
// The press fill (the old `active:bg-accent`) is applied by the row's Pressable.
export const itemRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  borderRadius: 2,
  paddingHorizontal: 8,
  paddingVertical: 6,
};

// `my-1 h-px bg-border`: the hairline that splits a group off (e.g. a trailing
// Delete) above the row that sets `separatorBefore`.
export function separator(tokens: ColorTokens): ViewStyle {
  return { marginVertical: 4, height: 1, backgroundColor: tokens.border };
}

// `text-sm` plus the per-row color: destructive rows are red-tinted
// (`text-red-600 dark:text-red-400`), link rows take the foreground, and action
// rows take the popover foreground. The size fragment is shared by the icon and
// label Texts so they line up.
export const rowTextSize: TextStyle = { fontSize: 14, lineHeight: 20 };

export function rowTextColor(item: RowMenuItem, links: boolean, tokens: ColorTokens, dark: boolean): TextStyle {
  if (item.destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
  return { color: links ? tokens.foreground : tokens["popover-foreground"] };
}
