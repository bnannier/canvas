import { type ViewStyle, type TextStyle, type DimensionValue } from "react-native";
import { type ColorTokens, palette, alpha, surfaceRipple, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";
import { type GridListSkin } from "./grid-lists.shared.js";
import { primaryText } from "../../style/primary-text.js";
import { destructiveText } from "../../style/destructive-text.js";

// Co-located GridList skins, one per platform. GridList takes the Canvas v4 hand-off's
// grid list (`K.def('grid-lists')` in tools/v4/handoff/cv-kit-data.js, with its
// code-driven form in cv-kit-code3.js `O('grid-lists')`). ONE structure and ONE set of
// (semantic) colors live in grid-lists.shared.tsx; the skin carries the gallery tile's
// frame, the grid density, the caption type and the press feedback on THIS molecule's
// own pressable (the gallery tile). The people tile composes the already-skinned Card,
// so the skin sets only its inset and type.
//
//   Web: a gallery tile is framed at the grid-tile corner on a 1px `border` hairline
//     over the `card` fill, its 110px thumbnail square at the top (clipped by the frame)
//     over a 10/12 caption: a 500 13 title over a 400 12 mono subtitle in the subtle
//     ink. Tiles sit 12 apart (8 compact); a people tile is inset 16 (12 compact) with a
//     500 14 title and a 400 12 subtitle in the subtle ink. Press = opacity dim (0.9).
//   iOS (HIG Collections, the platform's own collection idiom): the thumbnail stands on
//     its own at the iOS tile corner with the continuous curve, the caption under it, in
//     the hand-off's type and SF Pro; press = opacity dim (0.9).
//   Android: Material 3 has no grid list (PLATFORM-REFERENCES.md), so it draws the web
//     tile in Roboto; press = surfaceRipple, no opacity dim.

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

// The framed tile's thumbnail: full width, 110 tall, square (the frame clips its top corners).
export const galleryThumb: ViewStyle = { width: "100%", height: 110 };

// People card tile inner column (the avatar/title/subtitle stack inside Card).
export const cardInner: ViewStyle = { alignItems: "center", gap: 8 };

// Shared subtitle base: 400 12 in the subtle ink, identical on every platform.
function subtitleBase(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "400", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

export const badgeSpacing: ViewStyle = { marginTop: 4 };

export const actions: ViewStyle = { flexDirection: "row", gap: 8, marginTop: 8 };

// Resolve a color name (a semantic token key like "primary" or a Tailwind
// palette key like "blue-500") to its hex. Falls back to the muted-foreground
// token for an unknown name, so any tint composes safely.
export function resolveColor(tokens: ColorTokens, color: string): string {
  if (color === "primary-text") return primaryText(tokens);
  if (color === "destructive-text") return destructiveText(tokens);
  if (color in tokens) return tokens[color as keyof ColorTokens] ?? tokens["muted-foreground"];
  if (color in palette) return palette[color];
  return tokens["muted-foreground"];
}

// ---------- Web: the hand-off's framed tiles ----------
const galleryTile = (t: ColorTokens): ViewStyle => ({
  borderRadius: platformShape.web.gridTile,
  borderWidth: 1,
  borderColor: t.border,
  backgroundColor: t.card,
  overflow: "hidden",
});
const galleryTitle = (t: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: t["card-foreground"] });
const cardTitle = (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["card-foreground"] });
// The gallery subtitle is the hand-off's 400 12 mono meta line.
const gallerySubtitle = (t: ColorTokens): TextStyle => ({ ...subtitleBase(t), fontFamily: MONO_FONT });

export const webSkin: GridListSkin = {
  // The framed tile's corner (the thumbnail itself is square inside it).
  galleryRadius: platformShape.web.gridTile,
  galleryTile,
  galleryCaption: { paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  gap: { default: 12, compact: 8 },
  tilePad: { default: 16, compact: 12 },
  galleryTitle,
  cardTitle,
  gallerySubtitle,
  cardSubtitle: (t) => subtitleBase(t),
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG Collections): the thumbnail on its own ----------
// HIG Collections describe a flexible grid of content tiles; iOS keeps the thumbnail
// standing on its own at the iOS tile corner with Apple's continuous (superellipse)
// curve, the caption under it, in the hand-off's type and spacing. Press = opacity dim.
export const iosSkin: GridListSkin = {
  galleryRadius: shape.ios.tile,
  galleryCurve: "continuous",
  galleryTile: null,
  galleryCaption: webSkin.galleryCaption,
  gap: webSkin.gap,
  tilePad: webSkin.tilePad,
  galleryTitle,
  cardTitle,
  gallerySubtitle,
  cardSubtitle: (t) => subtitleBase(t),
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- Android: the web tile in Roboto, the ripple ----------
// Material 3 has no grid list, so the hand-off's framed tile is drawn here too; press =
// the shared surfaceRipple state layer (src/style/ripple.ts), no opacity dim.
export const androidSkin: GridListSkin = {
  ...webSkin,
  pressedOpacity: null,
  ripple: surfaceRipple,
};
