import { type TextStyle, type ViewStyle } from "react-native";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type EmblemSize } from "./emblem.shared.js";

// Co-located Emblem skins. The box, icon size, and semantic tint (in the shell) are
// platform-neutral, and no platform ships an icon tile, so every platform takes the v4
// hand-off's tile (the web skin below).

export interface EmblemSkin {
  /** Square edge per size, in px. */
  box: Record<EmblemSize, number>;
  /** Rendered icon glyph size per size, in px. */
  iconSize: Record<EmblemSize, number>;
  /** Corner radius (rounded-square shape) per size, in px. */
  radius: Record<EmblemSize, number>;
  /** Extra shape refinement on the emblem root (iOS: the app-icon continuous superellipse corner curve). */
  shape: ViewStyle;
  /** Monogram label type (weight, face); color comes from the shell. */
  monogram: TextStyle;
  /** Monogram size per tile size, in px (its line box is the same number). */
  monogramSize: Record<EmblemSize, number>;
  /** The tone's alpha in the tile's wash and in its 1px ring. */
  washAlpha: number;
  ringAlpha: number;
}

// The v4 hand-off's tile (`K.def('emblem')` in tools/v4/handoff/cv-kit-controls.js, and its
// code-driven icon override in cv-kit-code.js): 28, 40 and 56 px squares at 28% corners
// (8, 11, 16), the glyph at half the tile (14, 20, 28), the monogram at 36% of it (10, 14,
// 20) in the display face at 600. The tone paints the tile: an 18% wash, a 1px ring at
// 35%, and the surface's lit top edge (in the shell).
const box: Record<EmblemSize, number> = { small: 28, default: 40, large: 56 };
const iconSize: Record<EmblemSize, number> = { small: 14, default: 20, large: 28 };
const monogramSize: Record<EmblemSize, number> = { small: 10, default: 14, large: 20 };

// One look on every platform: no platform ships an icon tile, so the native skins are the
// web skin, with the continuous corner curve where the platform draws one (iOS; ignored
// elsewhere).
export const webSkin: EmblemSkin = {
  box,
  iconSize,
  radius: { small: platformShape.web.emblemSmall, default: platformShape.web.emblem, large: platformShape.web.emblemLarge },
  shape: { borderCurve: "continuous" },
  monogram: { fontFamily: DISPLAY_FONT, fontWeight: "600" },
  monogramSize,
  washAlpha: 0.18,
  ringAlpha: 0.35,
};

export const iosSkin: EmblemSkin = webSkin;
export const androidSkin: EmblemSkin = webSkin;
