import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette } from "../../style/index.js";

// Co-located Badge styles. The metadata badge uses semantic tokens; the status
// badge uses the Tailwind palette (a soft 50/200/700 surface in light, a
// 950/800/400 surface in dark) with a saturated 500 dot, and neutral stays on
// the semantic muted token.

export type Tone = "default" | "secondary" | "outline" | "destructive";
export type Status = "success" | "warning" | "error" | "info" | "neutral";

export const metaBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: 8,
  paddingVertical: 2,
};

export const statusBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  gap: 6,
  borderRadius: 9999,
  borderWidth: 1,
  paddingHorizontal: 8,
  paddingVertical: 2,
};

export const labelType: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

export function metaContainer(tokens: ColorTokens, tone: Tone): ViewStyle {
  switch (tone) {
    case "default": return { borderColor: "transparent", backgroundColor: tokens.primary };
    case "secondary": return { borderColor: "transparent", backgroundColor: tokens.secondary };
    case "outline": return { borderColor: tokens.border, backgroundColor: "transparent" };
    case "destructive": return { borderColor: "transparent", backgroundColor: tokens.destructive };
  }
}

export function metaLabel(tokens: ColorTokens, tone: Tone): TextStyle {
  switch (tone) {
    case "default": return { color: tokens["primary-foreground"] };
    case "secondary": return { color: tokens["secondary-foreground"] };
    case "outline": return { color: tokens.foreground };
    case "destructive": return { color: tokens["destructive-foreground"] };
  }
}

// The palette hue per status tone (neutral is handled on the semantic tokens).
const STATUS_HUE: Record<Exclude<Status, "neutral">, string> = {
  success: "green",
  warning: "amber",
  error: "red",
  info: "blue",
};

export function statusContainer(tokens: ColorTokens, dark: boolean, status: Status): ViewStyle {
  if (status === "neutral") return { borderColor: tokens.border, backgroundColor: tokens.muted };
  const hue = STATUS_HUE[status];
  return dark
    ? { borderColor: palette[`${hue}-800`], backgroundColor: palette[`${hue}-950`] }
    : { borderColor: palette[`${hue}-200`], backgroundColor: palette[`${hue}-50`] };
}

export function statusLabel(tokens: ColorTokens, dark: boolean, status: Status): TextStyle {
  if (status === "neutral") return { color: tokens["muted-foreground"] };
  const hue = STATUS_HUE[status];
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-700`] };
}

export function statusDot(tokens: ColorTokens, status: Status): ViewStyle {
  const base: ViewStyle = { height: 6, width: 6, borderRadius: 9999 };
  if (status === "neutral") return { ...base, backgroundColor: tokens["muted-foreground"] };
  return { ...base, backgroundColor: palette[`${STATUS_HUE[status]}-500`] };
}
