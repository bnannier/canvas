import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow } from "../../style/index.js";

// Co-located Stats styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the surfaces follow
// light/dark and read as glass when the ThemeProvider's surface is "glass",
// since tokens.card is swapped translucent at the theming level). The delta tone
// uses the Tailwind palette (a 600 hue in light, a 400 hue in dark), branched on
// the active scheme.

export type Surface = "card" | "plain";

// The bordered card surface, mirroring the docs `cardCls` plus its padding
// (rounded-lg border border-border bg-card shadow-sm p-5).
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 20,
    ...shadow("sm"),
  };
}

// The parent surface the plain variant nests on
// (rounded-lg border border-border bg-card shadow-sm p-6).
export function plainContainer(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 24,
    ...shadow("sm"),
  };
}

// A wrapping row: items flow left to right and wrap to the next line when they
// run out of room (flex-row flex-wrap).
export const row: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// Row gap by surface: plain stacks sit roomier (gap-6), cards pack tighter
// (gap-3.5).
export const rowGap: Record<Surface, ViewStyle> = {
  card: { gap: 14 },
  plain: { gap: 24 },
};

// Per-item minimum width and growth, by surface. Card items hold a wider floor
// and grow (flex-1 min-w-48); plain stacks pack tighter (min-w-28).
export const item: Record<Surface, ViewStyle> = {
  card: { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 192 },
  plain: { minWidth: 112 },
};

// Title type by surface (card: text-sm mb-3, plain: text-base mb-4).
export function title(tokens: ColorTokens, surface: Surface): TextStyle {
  return surface === "card"
    ? { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground, marginBottom: 12 }
    : { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground, marginBottom: 16 };
}

// --- one metric: label, value, optional delta -------------------------------

// text-sm text-muted-foreground
export function labelText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// mt-1 text-2xl font-semibold tracking-tight text-foreground
export function valueText(tokens: ColorTokens): TextStyle {
  return {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: tokens.foreground,
  };
}

// mt-1 text-xs font-medium, with the tone color applied on top.
export const deltaBase: TextStyle = { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: "500" };

// Delta tone: a rise reads green (text-green-600 dark:text-green-400), a decline
// reads red (text-red-600 dark:text-red-400).
export function deltaTone(dark: boolean, down: boolean): TextStyle {
  const hue = down ? "red" : "green";
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-600`] };
}
