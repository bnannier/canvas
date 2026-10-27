import type { TextStyle, ViewStyle } from "react-native";
import { MONO_FONT } from "./mono.js";
import { platformShape } from "./platform-shape.js";
import { shadow } from "./shadow.js";
import { shape, type ColorTokens } from "./tokens.js";

// The v4 hand-off's menu, the one look every web menu takes: K.panel holding the rows of
// its `dropdown` and `row-menu` renderers (tools/v4/handoff/cv-kit-overlays.js and
// cv-kit-inputs.js). Internal, not re-exported; the web Dropdown and RowMenu skins read it
// (and the Popover's compact card its panel), so the menus cannot drift apart.
//
// The panel is the `card` fill at the menu corner on the `border` hairline with the md
// shadow and a 4px inset. Rows touch (no gap between them): the menu-row corner, 10 in,
// a 400 14px label with 15px leading glyphs in the subtle ink; the height and the glyph gap
// are each renderer's own (the Dropdown's 36 / 10, the RowMenu's 34 / 8). A resting row
// under the pointer takes the `secondary` wash (the hand-off's sf3, its active row), a
// pressed one the firmer `accent`. The section heading is the 11px mono eyebrow, a
// trailing detail the 11px mono shortcut, both in the subtle ink, and the group rule is a
// `border` hairline 4 above and below, 6 in from the panel's sides. A disabled row takes
// the muted ink rather than a dim.

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

/**
 * The panel: shape, fill, hairline, shadow and inset. The shell adds the measured minimum
 * width. `outsideRing` draws the hairline as a 1px ring outside the box instead of a border
 * (the Popover's compact card, whose content sits flush with its edge).
 */
export function menuPanel(t: ColorTokens, outsideRing = false): ViewStyle {
  const md = shadow("md", t);
  return {
    borderRadius: shape.web.menu,
    borderWidth: outsideRing ? 0 : 1,
    borderColor: t.border,
    backgroundColor: t.card,
    padding: 4,
    ...md,
    ...(outsideRing ? { boxShadow: `${md.boxShadow}, 0 0 0 1px ${t.border}` } : null),
  };
}

/** The space between rows: they touch. */
export const MENU_ROW_GAP = 0;

/** A row: the glyph, the label and any trailing detail on one line, at the menu-row corner. */
export const menuRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: platformShape.web.menuRow,
  paddingHorizontal: 10,
};

/** The row label: 400 14px. */
export const menuRowLabel: TextStyle = { fontSize: 14, lineHeight: 18, fontWeight: "400" };

/** The leading glyph, and its ink at rest. */
export const MENU_ICON = 15;
export const menuIconColor = subtle;

/** The section heading above the rows: the 11px mono eyebrow in the subtle ink. */
export function menuSection(t: ColorTokens): TextStyle {
  return {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: subtle(t),
    paddingTop: 6,
    paddingHorizontal: 10,
    paddingBottom: 4,
  };
}

/** A trailing detail (a shortcut, a count): the 11px mono caption in the subtle ink. */
export function menuDetail(t: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", marginStart: "auto", color: subtle(t) };
}

/** The hairline between groups. */
export function menuSeparator(t: ColorTokens): ViewStyle {
  return { height: 1, marginTop: 4, marginBottom: 4, marginHorizontal: 6, backgroundColor: t.border };
}

/** A resting row under the pointer: the `secondary` wash. */
export function menuRowHover(t: ColorTokens): ViewStyle {
  return { backgroundColor: t.secondary };
}

/** A row while pressed. */
export function menuRowPressed(t: ColorTokens): ViewStyle {
  return { backgroundColor: t.accent };
}
