import type { TextStyle } from "react-native";
import type { ColorTokens } from "./tokens.js";

/** The original dense application field eyebrow. */
export function fieldEyebrow(tokens: ColorTokens): TextStyle {
  return { fontSize: 9.5, lineHeight: 12.35, fontWeight: "700", letterSpacing: 1.52, textTransform: "uppercase", color: tokens["muted-foreground"] };
}
