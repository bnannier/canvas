import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Tooltip styles. Layout-only parts (wrapper direction, bubble gap)
// are static objects keyed by placement; anything that reads a color (the bubble
// fill, the label) is a function of the active tokens, so the dark foreground
// bubble follows light/dark automatically.

export type Placement = "top" | "bottom" | "left" | "right";

// Wrapper layout per placement: a column for top/bottom (bubble stacked above or
// below the trigger), a row for left/right (bubble beside the trigger). Centered
// on the cross axis and shrunk to its content (self-start).
export const wrapper: Record<Placement, ViewStyle> = {
  top: { flexDirection: "column", alignItems: "center", alignSelf: "flex-start" },
  bottom: { flexDirection: "column", alignItems: "center", alignSelf: "flex-start" },
  left: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  right: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
};

// Gap between bubble and trigger (the old `m{b,t,r,l}-1.5` = 6), applied to the
// bubble on the trigger-facing side: top -> below, bottom -> above, etc.
export const bubbleGap: Record<Placement, ViewStyle> = {
  top: { marginBottom: 6 },
  bottom: { marginTop: 6 },
  left: { marginRight: 6 },
  right: { marginLeft: 6 },
};

// The bubble surface: a small dark pill on the foreground token (so it inverts
// against the page), with the menu radius and a soft lift.
export function bubble(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 6,
    backgroundColor: tokens.foreground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...shadow("md"),
  };
}

// The tip label: small, medium weight, painted in the background token so it
// reads as light text on the dark bubble.
export function bubbleLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.background };
}

// The icon trigger: a 40px square ghost button holding the settings glyph,
// matching a ghost icon Button. Press feedback (the old `active:opacity-90`) is
// applied by the component's Pressable.
export const iconTrigger: ViewStyle = {
  height: 40,
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};
