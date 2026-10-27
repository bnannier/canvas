import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, shape, widths } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";

// Co-located EmptyState skins, one per platform. EmptyState is a "Light" treatment: React
// Native gives no native empty-state control on iOS (SwiftUI's ContentUnavailableView is
// code-only) or Android (Material 3 dropped the M1/M2 empty-states pattern), so every
// platform draws the Canvas v4 hand-off's empty state (`K.def('empty-state')` in
// tools/v4/handoff/cv-kit-overlays.js) and the native skins share the web skin's parts,
// differing only in the face:
//
//   A centered column padded 40 by 24 (24 by 24 compact) with a 12 px rhythm (8 compact)
//   at the web row's empty-state corner; `bordered`
//   draws a 1.5 px dashed `field-border` edge, `elevated` the `card` fill under the
//   medium shade. The glyph sits on a 52 px tile (40 compact) at the card corner in the accent's soft wash
//   with the accent's ink (the success wash and green when `success`), a 22 px glyph
//   (18). The title is 500 19 (16 compact), in the display face on the web, tracked
//   -0.01em; the description 400 14 / 21 in the muted ink capped at 320 px; the action
//   sits 4 px further down.

export type Tone = "success" | "default";
export type Density = "compact" | "default";

// The contract a platform skin fulfills. The shell renders the centered column, the
// optional bordered or elevated surface, the glyph tile, the title, the description and
// the action; the skin maps each piece's measure and type.
export interface EmptyStateSkin {
  /** The centered column wrapper: its corner, padding and rhythm, per density. */
  container: Record<Density, ViewStyle>;
  /** The elevated surface's fill and shade. */
  elevated: (t: ColorTokens) => ViewStyle;
  /** The bordered surface's edge (corner + width + style); its color is shared. */
  borderedBase: ViewStyle;
  /** The glyph tile (size + corner), per density; its fill is shared by tone. */
  discBase: Record<Density, ViewStyle>;
  /** The glyph's size inside the tile, per density; its color is shared by tone. */
  glyphSize: Record<Density, number>;
  /** A text-character glyph's type. */
  glyph: TextStyle;
  /** Title type, per density (size / line-height / weight / tracking / face + color). */
  title: (t: ColorTokens, density: Density) => TextStyle;
  /** Description type (size / line-height + alignment + color + measure). */
  description: (t: ColorTokens) => TextStyle;
  /** The action button's inset above it (on top of the column's rhythm). */
  actionSpacing: ViewStyle;
}

// ---- Shared, platform-neutral color logic (the same on every OS) -------------

/** The bordered surface's edge color: the field boundary (the hand-off's `--ln2`). */
export function borderedSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens["field-border"] };
}

/** The glyph tile's fill per tone: the success wash, or the accent's soft wash. */
export function discTone(tokens: ColorTokens, tone: Tone): ViewStyle {
  return { backgroundColor: tone === "success" ? tokens["success-soft"] : tokens["primary-soft"] };
}

/** The glyph's color per tone: the solid green, or the accent's text ink. */
export function glyphTone(tokens: ColorTokens, tone: Tone): TextStyle {
  return { color: tone === "success" ? tokens.success : tokens["primary-text"] };
}

// ---- The hand-off's measures, shared by every skin -----------------------------

// The column and its edge at the empty-state corner, the glyph tile at the card corner.
const containerAt = (radius: number): Record<Density, ViewStyle> => ({
  default: { alignItems: "center", borderRadius: radius, paddingVertical: 40, paddingHorizontal: 24, gap: 12 },
  compact: { alignItems: "center", borderRadius: radius, paddingVertical: 24, paddingHorizontal: 24, gap: 8 },
});
const borderedAt = (radius: number): ViewStyle => ({ borderRadius: radius, borderWidth: 1.5, borderStyle: "dashed" });
const discAt = (radius: number): Record<Density, ViewStyle> => ({
  default: { height: 52, width: 52, borderRadius: radius, alignItems: "center", justifyContent: "center" },
  compact: { height: 40, width: 40, borderRadius: radius, alignItems: "center", justifyContent: "center" },
});
const ELEVATED = (tokens: ColorTokens): ViewStyle => ({ backgroundColor: tokens.card, ...shadow("md", tokens) });
const GLYPH_SIZE: Record<Density, number> = { default: 22, compact: 18 };
const GLYPH: TextStyle = { fontSize: 20, lineHeight: 28 };
// 500 at 19 (16 compact), the display face's normal leading, tracked -0.01em.
const TITLE: Record<Density, TextStyle> = {
  default: { fontSize: 19, lineHeight: 23, fontWeight: "500", letterSpacing: -0.19 },
  compact: { fontSize: 16, lineHeight: 20, fontWeight: "500", letterSpacing: -0.16 },
};
const description = (tokens: ColorTokens): TextStyle => ({
  textAlign: "center",
  fontSize: 14,
  lineHeight: 21,
  fontWeight: "400",
  maxWidth: widths.xs,
  color: tokens["muted-foreground"],
});
const ACTION_SPACING: ViewStyle = { marginTop: 4 };

const skinAt = (radius: number, discRadius: number, fontFamily?: string): EmptyStateSkin => ({
  container: containerAt(radius),
  elevated: ELEVATED,
  borderedBase: borderedAt(radius),
  discBase: discAt(discRadius),
  glyphSize: GLYPH_SIZE,
  glyph: GLYPH,
  title: (tokens, density) => ({ textAlign: "center", ...TITLE[density], ...(fontFamily ? { fontFamily } : null), color: tokens.foreground }),
  description,
  actionSpacing: ACTION_SPACING,
});

/** Web: the hand-off's empty state, its title in the display face. */
export const webSkin: EmptyStateSkin = skinAt(platformShape.web.emptyState, shape.web.card, DISPLAY_FONT);
// The native title: the web skin's, in the platform's own face.
const nativeTitle: EmptyStateSkin["title"] = (tokens, density) => ({ textAlign: "center", ...TITLE[density], color: tokens.foreground });
/** iOS: no native empty-state control; the web skin's parts, in SF Pro. */
export const iosSkin: EmptyStateSkin = { ...webSkin, title: nativeTitle };
/** Android: no Material 3 empty state; the web skin's parts, in Roboto. */
export const androidSkin: EmptyStateSkin = { ...webSkin, title: nativeTitle };
