import { alpha } from "./color.js";
import type { ColorTokens } from "./tokens.js";

/**
 * The fixed series hues a text tone names: Typography and Badge `cyan` and `mint`, the v4
 * hand-off's palette-independent `--cyan` and `--mint` (its chart series 2 and 3, the
 * `chart-2` and `chart-3` tokens). They stay put whatever the palette, so a section can
 * name three tiers mint, cyan and the accent and keep them apart under every palette.
 */
export type HueTone = "cyan" | "mint";

/** The series token each hue tone is. */
const SERIES_TOKEN: Record<HueTone, "chart-2" | "chart-3"> = { cyan: "chart-2", mint: "chart-3" };

/** The pill's wash: the hand-off's `color-mix(in oklch, var(--cyan) 16%, transparent)`. */
export const HUE_TONE_WASH = 0.16;

/** The hand-off's series color as ink, with its own 16% wash. */
export function hueToneColors(tokens: ColorTokens, _dark: boolean, tone: HueTone): { ink: string; wash: string } {
  return { ink: tokens[SERIES_TOKEN[tone]], wash: alpha(tokens[SERIES_TOKEN[tone]], HUE_TONE_WASH) };
}
