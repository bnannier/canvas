import { type Size } from "./sparkline.shared.js";

// Co-located Sparkline skins. Sparkline is a "Shared" treatment: a token-colored
// bar strip renders identically on every platform, so iosSkin and androidSkin
// reference the same bar radius / gap / heights as webSkin.

export interface SparklineSkin {
  /** Corner radius of each bar's data end (the top; the baseline stays square), in px. */
  barRadius: number;
  /** Gap between bars, in px. */
  gap: number;
  /** Strip height per size, in px (the tallest bar reaches this). */
  height: Record<Size, number>;
  /**
   * Intrinsic width, in px, used when the caller sets no width/flex. The bars
   * grow with `flexGrow`, so without a defined width they collapse to 0 and the
   * strip renders blank; this default gives them room while an explicit
   * `width`/`flex` still overrides it.
   */
  defaultWidth: number;
}

export const webSkin: SparklineSkin = {
  barRadius: 4,
  gap: 2,
  height: { compact: 16, default: 24, tall: 32 },
  defaultWidth: 120,
};

export const iosSkin: SparklineSkin = webSkin;
export const androidSkin: SparklineSkin = webSkin;
