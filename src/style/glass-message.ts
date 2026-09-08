import type { TextStyle } from "react-native";
import type { ThemeValue } from "./theme.js";

// Muted message text loses contrast when a light glass panel reveals its scrim.
// Preserve each skin's other curated colors, including translucent foregrounds.
// Keep the stronger color when accessibility preferences make glass opaque.
export function glassMessageStyle(style: TextStyle, theme: Pick<ThemeValue, "scheme" | "surface" | "tokens">): TextStyle {
  return theme.scheme === "light" && theme.surface === "glass" && style.color === theme.tokens["muted-foreground"]
    ? { ...style, color: theme.tokens["popover-foreground"] }
    : style;
}
