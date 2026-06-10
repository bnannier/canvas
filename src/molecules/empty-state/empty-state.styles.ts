import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, alpha } from "../../style/index.js";

// Co-located EmptyState styles. Layout-only fragments are static objects; the
// disc fill + glyph color read a color and so are functions of the active
// tokens. The `positive` tone paints the disc and glyph green from the fixed
// Tailwind palette (green-600), while the default tone stays on the semantic
// muted / muted-foreground tokens so it follows light/dark/glass.

export type Tone = "positive" | "default";

// The centered column. Bordered wraps it in a rounded, bordered card whose
// padding tightens under `compact`.
export const container: ViewStyle = { alignItems: "center" };

export const borderedBase: ViewStyle = { borderRadius: 8, borderWidth: 1 };

export function borderedSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border };
}

// Bordered card padding by density (compact tightens it for dense table cells).
export const borderedPad: Record<"compact" | "default", ViewStyle> = {
  compact: { paddingHorizontal: 16, paddingVertical: 24 },
  default: { paddingHorizontal: 24, paddingVertical: 32 },
};

// The round 48x48 icon disc.
export const discBase: ViewStyle = {
  marginBottom: 12,
  height: 48,
  width: 48,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
};

// Disc fill per tone: a 10% green wash when positive, the muted token otherwise.
export function discTone(tokens: ColorTokens, tone: Tone): ViewStyle {
  return tone === "positive"
    ? { backgroundColor: alpha(palette["green-600"], 0.1) }
    : { backgroundColor: tokens.muted };
}

// The glyph inside the disc (text-xl), colored per tone.
export const glyphBase: TextStyle = { fontSize: 20, lineHeight: 28 };

export function glyphTone(tokens: ColorTokens, tone: Tone): TextStyle {
  return tone === "positive" ? { color: palette["green-600"] } : { color: tokens["muted-foreground"] };
}

// Title: centered, semibold, foreground.
export function title(tokens: ColorTokens): TextStyle {
  return { textAlign: "center", fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
}

// Description: centered, muted, with a small inset above the title.
export function description(tokens: ColorTokens): TextStyle {
  return { marginTop: 4, textAlign: "center", fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The action button's inset above it.
export const actionSpacing: ViewStyle = { marginTop: 16 };
