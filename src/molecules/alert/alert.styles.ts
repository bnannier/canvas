import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette } from "../../style/index.js";

// Co-located Alert styles. The toned alerts (info / success / warning / error)
// draw from the Tailwind palette: a soft 50/200 surface with a 600/700/800 type
// ramp in light mode, flipping to a 950/800 surface with a 200/300/400 ramp in
// dark mode (the old dark: variant, resolved by branching on `dark`). The neutral
// default rides the semantic card / border / foreground tokens so it follows the
// theme (including glass) on its own.

export type Tone = "info" | "success" | "warning" | "error" | "neutral";

// flex-row items-start gap-3 rounded-lg border px-4 py-3
export const alertBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
  borderRadius: 8,
  borderWidth: 1,
  paddingHorizontal: 16,
  paddingVertical: 12,
};

// flex-1 gap-1 — the content column beside the icon.
export const content: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 4 };

// text-base leading-5 — the leading glyph.
export const iconType: TextStyle = { fontSize: 16, lineHeight: 20 };

// text-sm font-semibold — the title.
export const titleType: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "600" };

// text-sm — the description / body.
export const bodyType: TextStyle = { fontSize: 14, lineHeight: 20 };

// -mr-1 -mt-0.5 h-6 w-6 items-center justify-center rounded-md
// (active:opacity-70 is applied by the component's Pressable).
export const dismissButton: ViewStyle = {
  marginRight: -4,
  marginTop: -2,
  height: 24,
  width: 24,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};

// text-base leading-none — the dismiss glyph.
export const dismissType: TextStyle = { fontSize: 16, lineHeight: 16 };

// The palette hue per toned alert (neutral rides the semantic tokens).
const TONE_HUE: Record<Exclude<Tone, "neutral">, string> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

// Container border + fill. Light: 200 border / 50 surface; dark: 800 / 950.
// Neutral: semantic card surface with the border token.
export function container(tokens: ColorTokens, dark: boolean, tone: Tone): ViewStyle {
  if (tone === "neutral") return { borderColor: tokens.border, backgroundColor: tokens.card };
  const hue = TONE_HUE[tone];
  return dark
    ? { borderColor: palette[`${hue}-800`], backgroundColor: palette[`${hue}-950`] }
    : { borderColor: palette[`${hue}-200`], backgroundColor: palette[`${hue}-50`] };
}

// Icon color. Light: 600; dark: 400. Neutral: muted-foreground.
export function iconColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens["muted-foreground"] };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-600`] };
}

// Title color. Light: 800; dark: 200. Neutral: foreground.
export function titleColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens.foreground };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-200`] : palette[`${hue}-800`] };
}

// Body color. Light: 700; dark: 300. Neutral: muted-foreground.
export function bodyColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens["muted-foreground"] };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-300`] : palette[`${hue}-700`] };
}
