import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Button styles. Each axis (intent, size) maps to a plain RN style
// object built from the active brand tokens (passed in from useTheme, so colors
// follow light/dark and the glass surface). The component reads the active
// booleans, resolves one value per axis by precedence, and spreads these.

export type Intent = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
export type Size = "small" | "base" | "large";

// Foreground token per intent: the label color, and the loading-spinner color.
export const FG_TOKEN: Record<Intent, keyof ColorTokens> = {
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  destructive: "destructive-foreground",
  outline: "foreground",
  ghost: "foreground",
  link: "primary",
};

// Row of [spinner?, label], centered, with the pill radius. Press feedback
// (the old `active:opacity-90`) is applied by the component's Pressable.
export const containerBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 6,
};

// Padding/box per size. Icon buttons are square; text buttons pad H/V.
export function sizePad(size: Size, icon: boolean): ViewStyle {
  if (icon) {
    const d = size === "small" ? 32 : size === "large" ? 48 : 40;
    return { width: d, height: d };
  }
  if (size === "small") return { paddingHorizontal: 12, paddingVertical: 6 };
  if (size === "large") return { paddingHorizontal: 24, paddingVertical: 12 };
  return { paddingHorizontal: 16, paddingVertical: 8 };
}

// Container fill/border per intent.
export function intentContainer(tokens: ColorTokens, intent: Intent): ViewStyle {
  switch (intent) {
    case "primary": return { backgroundColor: tokens.primary };
    case "secondary": return { backgroundColor: tokens.secondary };
    case "destructive": return { backgroundColor: tokens.destructive };
    case "outline": return { borderWidth: 1, borderColor: tokens.input, backgroundColor: "transparent" };
    case "ghost": return { backgroundColor: "transparent" };
    case "link": return { backgroundColor: "transparent" };
  }
}

export const labelBase: TextStyle = { fontWeight: "500" };

// Label type per size.
export function sizeLabel(size: Size): TextStyle {
  if (size === "large") return { fontSize: 16, lineHeight: 24 };
  if (size === "small") return { fontSize: 12, lineHeight: 16 };
  return { fontSize: 14, lineHeight: 20 };
}

// Label color (+ underline for link) per intent.
export function intentLabel(tokens: ColorTokens, intent: Intent): TextStyle {
  switch (intent) {
    case "primary": return { color: tokens["primary-foreground"] };
    case "secondary": return { color: tokens["secondary-foreground"] };
    case "destructive": return { color: tokens["destructive-foreground"] };
    case "outline": return { color: tokens.foreground };
    case "ghost": return { color: tokens.foreground };
    case "link": return { color: tokens.primary, textDecorationLine: "underline" };
  }
}
