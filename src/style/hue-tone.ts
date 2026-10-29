import { alpha } from "./color.js";
import { SOLVED_INKS } from "./solved-inks.js";
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

/**
 * A hue tone's ink and wash in a scheme. The ink is the series colour walked in oklch
 * lightness at its own hue until it reads at 4.5:1 on every neutral surface and on its
 * own wash (tools/v4/derive-inks.ts, solved into src/style/solved-inks.ts); the dark
 * scheme's light series clears that as it is. The wash is the series token at 16%.
 */
export function hueToneColors(tokens: ColorTokens, dark: boolean, tone: HueTone): { ink: string; wash: string } {
  return { ink: SOLVED_INKS[dark ? "dark" : "light"].hues[tone], wash: alpha(tokens[SERIES_TOKEN[tone]], HUE_TONE_WASH) };
}
