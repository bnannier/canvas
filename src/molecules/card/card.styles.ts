import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Card styles. Layout-only parts are static objects; anything that
// reads a color is a function of the active tokens (so the surface follows
// light/dark, and reads as glass when the ThemeProvider's surface is "glass",
// since tokens.card is swapped translucent at the theming level).

export type Elevation = "raised" | "flat" | "default";
export type Density = "compact" | "comfortable" | "default";

export const cardBase: ViewStyle = { borderRadius: 8, borderWidth: 1 };

// The card surface fill + border. tokens.card goes translucent under glass.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.card };
}

// Elevation: raised lifts the shadow, flat drops it, default is the soft shadow.
export function elevation(e: Elevation): ViewStyle {
  return e === "raised" ? shadow("md") : e === "flat" ? shadow("none") : shadow("sm");
}

// Density sets the card's own content padding and the gap between flat children.
export const density: Record<Density, ViewStyle> = {
  compact: { padding: 16, gap: 12 },
  comfortable: { padding: 32, gap: 24 },
  default: {},
};

// The standard inset applied by `padded` when no density is set.
export const padded: ViewStyle = { padding: 24 };

// --- subcomponent styles ----------------------------------------------------

export const header: ViewStyle = { gap: 6, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 20 };

export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 20, lineHeight: 28, fontWeight: "600", letterSpacing: -0.4, color: tokens["card-foreground"] };
}

export function description(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

export const content: ViewStyle = { paddingHorizontal: 20, paddingVertical: 20 };

export const footer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 20,
  paddingBottom: 20,
  paddingTop: 16,
};

export function separator(tokens: ColorTokens): ViewStyle {
  return { height: 1, width: "100%", backgroundColor: tokens.border };
}

export function bodyText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] };
}

export function footerText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}
