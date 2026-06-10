import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Kbd styles. The cap has one fixed look (no axes), so the layout-only
// box geometry is a static fragment and the colored surface (border + muted fill)
// plus the muted label color are functions of the active tokens (so the cap
// follows light/dark and reads as glass at the theming level).

// The key-cap box: a centered row, fixed cap height, a minimum width so a single
// glyph still reads as a key, the small radius, a hairline border, and snug
// horizontal padding.
export const capBox: ViewStyle = {
  flexDirection: "row",
  height: 20,
  minWidth: 20,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  borderWidth: 1,
  paddingHorizontal: 6,
};

// The cap surface: the muted fill and the hairline border color.
export function capSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.muted };
}

// The key label: small, medium-weight, muted text.
export const labelType: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

export function labelColor(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}
