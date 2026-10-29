import { type TextStyle, type ViewStyle } from "react-native";
import { shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
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
  /** Gap between the block and its label column (the label under the block). */
  gap: number;
  /** Gap between the block and its label column when `inline` puts the label beside it. */
  inlineGap: number;
  /** Gap between the label column's lines (a tight name/value/detail lockup). */
  lineGap: number;
  /** The name line's type; color comes from the shell. */
  name: TextStyle;
  /** The primary mono value line's type; family and color come from the shell. */
  value: TextStyle;
  /** The secondary mono detail line's type; family and color come from the shell. */
  detail: TextStyle;
  /** The `centered` lockup's gap: the label column centred under the chip, 10 px below it. */
  centeredGap: number;
  /** The `glow` shadow, the fill's own ambient light under the chip at `alpha` of the fill. */
  glow: { offsetY: number; blur: number; spread: number; alpha: number };
  /**
   * The `tile`: the labelled colour tile, its name inside the fill. Its height per size (a
   * bottom-aligned name at the default, a centred one `small`), its inset and its name type.
   */
  tile: { height: { default: number; small: number }; inset: number; name: TextStyle };
  /** The `bar`: the parent's width at this height and corner, its edge the hairline. */
  bar: { height: number; radius: number };
  /**
   * `steps`: one bar of colour steps. Flush, the bar is clipped at `flushRadius` at the size's
   * height; `segmented`, the steps stand `segmentGap` apart in a `segmentedHeight` bar, each at
   * the `innerRadius` corner but for the bar's two outer ends at `endRadius`.
   */
  steps: { flushRadius: number; segmentedHeight: number; segmentGap: number; innerRadius: number; endRadius: number };
  /** The `compact` lockup: the stretched chip's height, the mono name and value, their gaps. */
  compact: { box: number; gap: number; lineGap: number; name: TextStyle; value: TextStyle };
  /** The palette picker's disc edge, in px. */
  picker: number;
  /**
   * The palette picker's hover growth: the disc scales by `scale` over `duration` ms on
   * `easing`. Web only (null on native, where the kit declares no pointer hover yet).
   */
  pickerHover: { scale: number; duration: number; easing: string } | null;
}

// Platform-neutral metrics, shared by all three skins (the Emblem precedent: only a
// real per-OS difference is written out per skin). The hand-off's Swatch renderer
// (`K.def('swatch')` in tools/v4/handoff/cv-kit-controls.js): a 32, 48 or 72 px chip at
// the tile corner (`shape.web.tile`), the label 8 px under it (10 px beside it when inline), the name a
// 500 13 px line and the value lines 400 11 px mono in the subtle ink, set flush (each line
// at its face's normal line box: 16 px for the 13 px name and 14 px for the 11 px mono
// values, the renderer's `font:500 13px` and `font:400 11px` at `normal`). `tiny` is the token chip's
// swatch (Component.dc.html line 294: `width:20px;height:20px;border-radius:50%`), the
// 20 px disc inside a 32 px token pill; the page draws it only as a circle, so off the
// circle it takes the same tile corner as the other sizes.
const box: Record<SwatchSize, number> = { tiny: 20, small: 32, default: 48, large: 72 };
const gap = 8;
const inlineGap = 10;
const lineGap = 0;

// Web: the hand-off's chip at every size, the continuous corner curve where the platform
// draws one (iOS; ignored elsewhere). A color sample has no platform control, so the
// native skins are the web skin.
export const webSkin: SwatchSkin = {
  box,
  radius: { tiny: shape.web.tile, small: shape.web.tile, default: shape.web.tile, large: shape.web.tile },
  shape: { borderCurve: "continuous" },
  gap,
  inlineGap,
  lineGap,
  name: { fontSize: 13, lineHeight: 16, fontWeight: "500" },
  value: { fontSize: 11, lineHeight: 14, fontWeight: "400" },
  detail: { fontSize: 11, lineHeight: 14, fontWeight: "400" },
  // The Foundations section page's samples (Canvas v4.0.0 Foundations.dc.html): the
  // spectrum's circles (`box-shadow:0 12px 30px -8px` the fill at .6, the hue 10 px under
  // the chip, centred), the status tiles (64 and 40 px, `padding:8px`, `font:500 11px
  // var(--fm)` on the mono face's 14 px line), the neutral bars (26 px at the bar corner),
  // the series bar (28 px, 4 apart, the step corner inside and the bar's at its ends), the
  // accent ramp (one bar clipped at the ramp corner) and the emblem card's named blocks (56 px, the name `font:500 12px
  // var(--fm)` and the value `font:400 10px var(--fm)` on their 16 and 13 px lines, 6 apart).
  centeredGap: 10,
  glow: { offsetY: 12, blur: 30, spread: -8, alpha: 0.6 },
  tile: { height: { default: 64, small: 40 }, inset: 8, name: { fontSize: 11, lineHeight: 14, fontWeight: "500" } },
  bar: { height: 26, radius: platformShape.web.swatchBar },
  steps: { flushRadius: platformShape.web.rampBar, segmentedHeight: 28, segmentGap: 4, innerRadius: platformShape.web.swatchStep, endRadius: platformShape.web.swatchBar },
  compact: { box: 56, gap: 6, lineGap: 6, name: { fontSize: 12, lineHeight: 16, fontWeight: "500" }, value: { fontSize: 10, lineHeight: 13, fontWeight: "400" } },
  // The hand-off docs navbar's hue swatch (Controls.dc.html): a 16 px disc that grows to
  // 1.25 under the pointer on a .4 s overshooting curve. Local to this skin rather than in
  // the HOVER table: no other control grows on hover, and the value is the hand-off's.
  picker: 16,
  pickerHover: webHover({ scale: 1.25, duration: 400, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }),
};

export const iosSkin: SwatchSkin = webSkin;
export const androidSkin: SwatchSkin = webSkin;
