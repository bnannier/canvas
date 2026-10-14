import { alpha } from "./color.js";
import type { ColorTokens } from "./tokens.js";

/**
 * The fill of a modal backdrop: the theme's `scrim` role (Dark Factory's tinted dim,
 * the same on every platform), or, for a legacy token map without one, black at the
 * skin's own alpha. A backdrop that fades in paints this color and animates its opacity
 * from 0 to 1, so the color's own alpha is the resting dim. Under glass on the web the
 * scrim also blurs what it dims by Dark Factory's 2 px (`useScrimFrost` and `useHeldScrim`
 * in glass-surface/scrim-frost.tsx, the owner's GS-6 decision), the fill unchanged and
 * painted by the element that blurs, so the blur never samples it (a Dialog's and an
 * AlertDialog's on a layer beneath the card).
 */
export function scrimFill(tokens: ColorTokens, legacyAlpha: number): string {
  return tokens.scrim ?? alpha("#000000", legacyAlpha);
}
