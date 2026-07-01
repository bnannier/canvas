import { type Size } from "./sparkline.shared.js";

// Co-located Sparkline skins. Sparkline is a "Shared" treatment: a token-colored
// bar strip renders identically on every platform, so iosSkin and androidSkin
// reference the same bar radius / gap / heights as webSkin.

export interface SparklineSkin {
  /** Corner radius of each bar, in px. */
  barRadius: number;
  /** Gap between bars, in px. */
  gap: number;
  /** Strip height per size, in px (the tallest bar reaches this). */
  height: Record<Size, number>;
}

export const webSkin: SparklineSkin = {
  barRadius: 2,
  gap: 2,
  height: { compact: 16, default: 24, tall: 32 },
};

export const iosSkin: SparklineSkin = webSkin;
export const androidSkin: SparklineSkin = webSkin;
