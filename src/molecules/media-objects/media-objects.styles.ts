import { type ViewStyle, type TextStyle, type ImageStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located MediaObject styles. Layout-only fragments are static objects; parts
// that read a color are functions of the active tokens, so the bordered card
// surface follows light/dark (and reads as glass when the ThemeProvider's
// surface is "glass", since tokens.card is swapped translucent at the theming
// level) and the tinted icon box derives from the brand primary.

export type Align = "center" | "start";
export type Direction = "reversed" | "leading";

// flexDirection per direction (flex-row vs flex-row-reverse).
export const DIRECTION_ROW: Record<Direction, ViewStyle["flexDirection"]> = {
  leading: "row",
  reversed: "row-reverse",
};

// alignItems per alignment (items-center vs items-start).
export const ALIGN_ITEMS: Record<Align, ViewStyle["alignItems"]> = {
  center: "center",
  start: "flex-start",
};

// The bare row: flex-row(-reverse) + gap-3 + items-*. The base layout-only part;
// flexDirection/alignItems are composed on top from the axis records above.
export const containerBase: ViewStyle = { gap: 12 };

// bordered: wraps the row in the card surface (rounded-lg border border-border
// bg-card p-4). tokens.card goes translucent under glass.
export function borderedSurface(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 16 };
}

// Leading photo wrapper: shrink-0 w-10 h-10 overflow-hidden rounded-full bg-muted.
export function photoBox(tokens: ColorTokens): ViewStyle {
  return {
    flexShrink: 0,
    width: 40,
    height: 40,
    overflow: "hidden",
    borderRadius: 9999,
    backgroundColor: tokens.muted,
  };
}

// The photo itself: w-full h-full rounded-full.
export const photoImage: ImageStyle = { width: "100%", height: "100%", borderRadius: 9999 };

// The leading icon box: shrink-0 items-center justify-center w-9 h-9 rounded-md
// bg-primary/15 — a fixed tinted square with the glyph centered.
export function iconBox(tokens: ColorTokens): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: alpha(tokens.primary, 0.15),
  };
}

// The glyph inside the icon box: text-primary text-base font-semibold.
export function iconGlyph(tokens: ColorTokens): TextStyle {
  return { color: tokens.primary, fontSize: 16, lineHeight: 24, fontWeight: "600" };
}

// Content column: min-w-0 flex-1 gap-0.5 — lets the text truncate instead of
// pushing a trailing action out of alignment.
export const content: ViewStyle = { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 2 };

// Title line: text-sm font-semibold text-foreground.
export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
}

// Description line: text-xs text-muted-foreground.
export function description(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// Body paragraph: text-sm text-foreground leading-relaxed.
export function body(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 28, color: tokens.foreground };
}

// Trailing meta text: shrink-0 text-xs text-muted-foreground.
export function meta(tokens: ColorTokens): TextStyle {
  return { flexShrink: 0, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// Trailing action wrapper: shrink-0.
export const actionBox: ViewStyle = { flexShrink: 0 };
