import { type ViewStyle, type TextStyle, type DimensionValue } from "react-native";
import { type ColorTokens, palette, alpha } from "../../style/index.js";
import { type GridListSkin } from "./grid-lists.shared.js";

// Co-located GridList skins, one per platform. GridList is a "Light" treatment:
// ONE structure and ONE set of (semantic) colors live in grid-lists.shared.tsx;
// only the per-OS touches travel through the skin — the gallery thumbnail's
// corner radius, the inter-tile gap / per-tile padding density, the title/subtitle
// type tracking, and the press feedback (Android ripple vs iOS/web opacity dim) on
// THIS molecule's own pressable (the gallery tile). The bordered people tile
// delegates its surface and press feedback to the already-skinned-per-build Card
// atom, so the GridList skin never restyles it.
//
// The BRAND survives on every platform: tile tints come from the same item color
// resolved against the brand tokens, and the type colors are the same semantic
// tokens. Only the native SHAPE/density/tracking/feedback shift:
//   Web: the established Canvas look (lifted verbatim) — gallery block radius 6,
//     gap 14 (compact 8), tile padding 20 (compact 16), title 14/600, subtitle 12,
//     press = opacity dim (~0.9), no tracking adjustment.
//   iOS (HIG Collections): SF conventions — a slightly softer 10pt thumbnail
//     radius, the same comfortable spacing, and a small negative tracking on the
//     title/subtitle (the SF optical tightening); press = opacity dim (~0.9).
//   Android (Material 3): M3 corner + type conventions — a more-rounded 12dp
//     thumbnail (M3 medium shape), a touch more breathing room in the grid gap,
//     M3 label tracking (+0.1 title, +0.25 subtitle, weight 500 title); press =
//     android_ripple (a neutral surface state layer), no opacity dim.

export type Columns = "cols2" | "cols3";

// Per-tile width share per column count (the desktop, `base` value). The
// fraction leaves room for the gap; `grow` (applied alongside) lets a trailing
// tile expand to fill, and the responsive `sm` value (`sm:w-full`) collapses
// each tile to a single column on phones and below (desktop-first). Shared by
// every platform — the column math is one source of truth.
export const TILE_WIDTH: Record<Columns, DimensionValue> = {
  cols2: "48%",
  cols3: "31%",
};

// --- shared layout fragments (identical across platforms) -------------------

// Container: a wrapping flex row. The per-tile gap is supplied by the skin so the
// density touch can vary per OS.
export const container: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// Each tile grows to share the row; the width share is layered in by the tile.
export const tileGrow: ViewStyle = { flexGrow: 1 };

// Gallery thumbnail block geometry that does not vary (full width, fixed height);
// the corner radius is the per-OS touch and travels through the skin.
export const galleryBlock: ViewStyle = { width: "100%", height: 128 };

// The gallery tint is the item color at 20% (bg-{color}/20), falling back to the
// muted surface. Shared: the brand/palette tint is identical on every platform.
export function galleryBlockFill(tokens: ColorTokens, color?: string): ViewStyle {
  return { backgroundColor: color != null ? alpha(resolveColor(tokens, color), 0.2) : tokens.muted };
}

export const galleryMeta: ViewStyle = { marginTop: 8 };

export function gallerySubtitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// People card tile inner column (the avatar/title/subtitle stack inside Card).
export const cardInner: ViewStyle = { alignItems: "center", gap: 8 };

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

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// gallery block radius 6; gap 14 (compact 8); tile padding 20 (compact 16);
// title 14/600 card-foreground, subtitle 12 muted; press = opacity dim (0.9).
export const webSkin: GridListSkin = {
  galleryRadius: 6,
  gap: { default: 14, compact: 8 },
  tilePad: { default: 20, compact: 16 },
  galleryTitle: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["card-foreground"] }),
  cardTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", color: t["card-foreground"] }),
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG Collections): SF type tightening, softer thumbnail ----------
// HIG Collections describe a flexible grid of content tiles; iOS keeps the same
// comfortable spacing as web, softens the thumbnail corner a touch (10pt, between
// the 6pt web block and an iOS continuous corner), and applies SF's small optical
// tracking on the title/subtitle. Press = opacity dim (~0.9), the iOS norm.
export const iosSkin: GridListSkin = {
  galleryRadius: 10,
  gap: { default: 14, compact: 8 },
  tilePad: { default: 20, compact: 16 },
  galleryTitle: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: -0.08, color: t["card-foreground"] }),
  cardTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: -0.2, color: t["card-foreground"] }),
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- Android (Material 3): more rounding, M3 label tracking, ripple ----------
// M3 has no grid list, so this applies M3 CONVENTIONS to the shared structure:
// the thumbnail takes the M3 medium-shape 12dp corner, the grid breathes a touch
// more (gap 16, compact 8), and the labels carry M3 label tracking (title +0.1
// weight 500, subtitle +0.25). Press = android_ripple (a neutral surface state
// layer) instead of an opacity dim.
export const androidSkin: GridListSkin = {
  galleryRadius: 12,
  gap: { default: 16, compact: 8 },
  tilePad: { default: 20, compact: 16 },
  galleryTitle: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.25, color: t["card-foreground"] }),
  cardTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1, color: t["card-foreground"] }),
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),
};
