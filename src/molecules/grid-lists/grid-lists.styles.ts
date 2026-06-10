import { type ViewStyle, type TextStyle, type DimensionValue } from "react-native";
import { type ColorTokens, palette, alpha } from "../../style/index.js";

// Co-located GridList styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens, so the tiles follow
// light/dark and read as glass when the ThemeProvider's surface is "glass"
// (since tokens.card / tokens.muted swap at the theming level).

export type Columns = "cols2" | "cols3";

// Per-tile width share per column count (the desktop, `base` value). The
// fraction leaves room for the gap; `grow` (applied alongside) lets a trailing
// tile expand to fill, and the responsive `sm` value (`sm:w-full`) collapses
// each tile to a single column on phones and below (desktop-first).
export const TILE_WIDTH: Record<Columns, DimensionValue> = {
  cols2: "48%",
  cols3: "31%",
};

// Container: a wrapping flex row. `compact` tightens the inter-tile gap
// (gap-2 -> 8) from the default (gap-3.5 -> 14).
export const container: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };
export function containerGap(compact: boolean): ViewStyle {
  return { gap: compact ? 8 : 14 };
}

// Each tile grows to share the row; the width share is layered in by the tile.
export const tileGrow: ViewStyle = { flexGrow: 1 };

// --- gallery mode -----------------------------------------------------------

// The square color block: full width, fixed height, rounded. The tint is the
// item color at 20% (bg-{color}/20), falling back to the muted surface.
export const galleryBlock: ViewStyle = { width: "100%", height: 128, borderRadius: 6 };

export function galleryBlockFill(tokens: ColorTokens, color?: string): ViewStyle {
  return { backgroundColor: color != null ? alpha(resolveColor(tokens, color), 0.2) : tokens.muted };
}

export const galleryMeta: ViewStyle = { marginTop: 8 };

export function galleryTitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["card-foreground"] };
}

export function gallerySubtitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- people / card mode -----------------------------------------------------

// Card tile surface composition: grow + center + width share + padding
// (p-4 -> 16 compact, p-5 -> 20). The width share is layered in by the tile.
export function tilePad(compact: boolean): ViewStyle {
  return { flexGrow: 1, alignItems: "center", padding: compact ? 16 : 20 };
}

export const cardInner: ViewStyle = { alignItems: "center", gap: 8 };

export function cardTitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens["card-foreground"] };
}

export function cardSubtitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

export const badgeSpacing: ViewStyle = { marginTop: 4 };

export const actions: ViewStyle = { flexDirection: "row", gap: 8, marginTop: 8 };

// Resolve a color name (a semantic token key like "primary" or a Tailwind
// palette key like "blue-500") to its hex. Falls back to the muted-foreground
// token for an unknown name, so any tint composes safely.
function resolveColor(tokens: ColorTokens, color: string): string {
  if (color in tokens) return tokens[color as keyof ColorTokens];
  if (color in palette) return palette[color];
  return tokens["muted-foreground"];
}
