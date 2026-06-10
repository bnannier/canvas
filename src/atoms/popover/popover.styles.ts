import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Popover styles. Layout-only parts are static objects; anything that
// reads a color is a function of the active tokens (so the floating card follows
// light/dark, and reads as glass when the ThemeProvider's surface is "glass",
// since tokens.popover is swapped translucent at the theming level).

export type Placement = "top" | "bottom";

// The outer wrapper when a trigger is present: it anchors the absolutely
// positioned card (`relative`) and hugs its content (`self-start`).
export const wrapper: ViewStyle = { position: "relative", alignSelf: "flex-start" };

// The trigger button is wrapped so it hugs its content rather than stretching.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// The floating card frame: fixed 260px width, the menu radius, border, and the
// surface inset. Color (border + fill) is layered on by `cardSurface`.
export const cardBase: ViewStyle = {
  width: 260,
  borderRadius: 8,
  borderWidth: 1,
  padding: 16,
  ...shadow("lg"),
};

// With a trigger, the card floats below it (the wrapper is `relative`): pinned
// to the wrapper's bottom-left, lifted above siblings, with a small gap.
export const cardFloating: ViewStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  zIndex: 50,
  marginTop: 8,
};

// The card surface fill + border. tokens.popover goes translucent under glass.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.popover };
}

// --- card content -----------------------------------------------------------

// The popover heading: small, semibold, on the popover foreground.
export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens["popover-foreground"] };
}

// The supporting line beneath the title: small, muted, spaced from the title.
export function description(tokens: ColorTokens): TextStyle {
  return { marginTop: 4, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The action row: a right-aligned button, spaced from the body above it.
export const actionRow: ViewStyle = { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" };
