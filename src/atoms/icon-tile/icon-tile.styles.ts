import { type TextStyle, type ViewStyle } from "react-native";
import { type TileSize } from "./icon-tile.shared.js";

// Co-located IconTile skins. IconTile is a "Light" treatment: the box, icon size,
// and semantic tint (in the shell) are platform-neutral; only the corner radius,
// the iOS corner curve, and the monogram label type shift per OS (Material rounds
// icon containers more than iOS/web; iOS draws its app-icon tiles with the
// continuous superellipse curve; Material label type is 500 weight with positive
// tracking).

export interface IconTileSkin {
  /** Square edge per size, in px. */
  box: Record<TileSize, number>;
  /** Rendered icon glyph size per size, in px. */
  iconSize: Record<TileSize, number>;
  /** Corner radius (rounded-square shape) per size, in px. */
  radius: Record<TileSize, number>;
  /** Extra shape refinement on the tile root (iOS: the app-icon continuous superellipse corner curve). */
  shape: ViewStyle;
  /** Monogram label type (weight/tracking); size, line-height, and color come from the shell. */
  monogram: TextStyle;
}

const box: Record<TileSize, number> = { small: 32, default: 40, large: 48 };
const iconSize: Record<TileSize, number> = { small: 16, default: 20, large: 24 };

// Web: the Catalyst rounded square.
export const webSkin: IconTileSkin = {
  box,
  iconSize,
  radius: { small: 6, default: 8, large: 10 },
  shape: {},
  monogram: { fontWeight: "600" },
};

// iOS: the same rounded square, drawn with Apple's continuous (superellipse)
// corner curve to match the app-icon idiom. borderCurve is an iOS-only RN style
// prop (a no-op elsewhere).
export const iosSkin: IconTileSkin = {
  ...webSkin,
  shape: { borderCurve: "continuous" },
};

// Material 3 rounds the icon container more; the monogram reads as a Material
// label (500 weight, +0.1 tracking — the kit's Avatar-initials precedent).
export const androidSkin: IconTileSkin = {
  box,
  iconSize,
  radius: { small: 8, default: 12, large: 16 },
  shape: {},
  monogram: { fontWeight: "500", letterSpacing: 0.1 },
};
