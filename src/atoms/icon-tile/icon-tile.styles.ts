import { type TileSize } from "./icon-tile.shared.js";

// Co-located IconTile skins. IconTile is a "Light" treatment: the box, icon size,
// and semantic tint (in the shell) are platform-neutral; only the corner radius
// shifts per OS (Material rounds icon containers more than iOS/web).

export interface IconTileSkin {
  /** Square edge per size, in px. */
  box: Record<TileSize, number>;
  /** Rendered icon glyph size per size, in px. */
  iconSize: Record<TileSize, number>;
  /** Corner radius (rounded-square shape) per size, in px. */
  radius: Record<TileSize, number>;
}

const box: Record<TileSize, number> = { small: 32, default: 40, large: 48 };
const iconSize: Record<TileSize, number> = { small: 16, default: 20, large: 24 };

// Web / iOS: the Catalyst / HIG rounded square.
export const webSkin: IconTileSkin = {
  box,
  iconSize,
  radius: { small: 6, default: 8, large: 10 },
};

export const iosSkin: IconTileSkin = webSkin;

// Material 3 rounds the icon container more.
export const androidSkin: IconTileSkin = {
  box,
  iconSize,
  radius: { small: 8, default: 12, large: 16 },
};
