import { type TextStyle, type ViewStyle } from "react-native";
import { shape } from "../../style/index.js";
import { webHover } from "../../style/hover.js";
import { type SwatchSize } from "./swatch.shared.js";

// Co-located Swatch skins. The block sizes, the label lockup, and every color (in the
// shell) are platform-neutral, and no platform ships a color sample, so every platform
// takes Dark Factory's tile (the web skin below), as Emblem does.
//
// The skins carry SHAPE and TYPE metrics only. No skin holds a color: the fill is the
// caller's `color`, and the hairline plus the three label colors come from the active
// theme tokens in the shell, so a Swatch follows light/dark without a per-OS palette.

export interface SwatchSkin {
  /** Block edge per size, in px (the block's HEIGHT when `block` stretches its width). */
  box: Record<SwatchSize, number>;
  /** Corner radius of the block per size, in px (ignored when `circle` is set). */
  radius: Record<SwatchSize, number>;
  /** Extra shape refinement on the block (iOS: the continuous superellipse corner curve). */
  shape: ViewStyle;
  /** Gap between the block and its label column. */
  gap: number;
  /** Gap between the label column's lines (a tight name/value/detail lockup). */
  lineGap: number;
  /** The name line's type (weight/tracking); size, line height, and color come from the shell. */
  name: TextStyle;
  /** The primary mono value line's type; size, line height, family, and color come from the shell. */
  value: TextStyle;
  /** The secondary mono detail line's type; size, line height, family, and color come from the shell. */
  detail: TextStyle;
  /** The palette picker's disc edge, in px. */
  picker: number;
  /**
   * The palette picker's hover growth: the disc scales by `scale` over `duration` ms on
   * `easing`. Web only (null on native, where the kit declares no pointer hover yet).
   */
  pickerHover: { scale: number; duration: number; easing: string } | null;
}

// Platform-neutral metrics, shared by all three skins (the Emblem precedent: only a
// real per-OS difference is written out per skin).
const box: Record<SwatchSize, number> = { small: 40, default: 56, large: 72 };
const gap = 8;
const lineGap = 2;

// Web: Dark Factory's tile corner at every size, the continuous corner curve where the
// platform draws one (iOS; ignored elsewhere), and its label weights, a 700 name over a
// 500 value and a 400 detail. A color sample has no platform control, so the native skins
// are the web skin.
export const webSkin: SwatchSkin = {
  box,
  radius: { small: shape.web.tile, default: shape.web.tile, large: shape.web.tile },
  shape: { borderCurve: "continuous" },
  gap,
  lineGap,
  name: { fontWeight: "700" },
  value: { fontWeight: "500" },
  detail: { fontWeight: "400" },
  // The hand-off docs navbar's hue swatch (Controls.dc.html): a 16 px disc that grows to
  // 1.25 under the pointer on a .4 s overshooting curve. Local to this skin rather than in
  // the HOVER table: no other control grows on hover, and the value is the hand-off's.
  picker: 16,
  pickerHover: webHover({ scale: 1.25, duration: 400, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }),
};

export const iosSkin: SwatchSkin = webSkin;
export const androidSkin: SwatchSkin = webSkin;
