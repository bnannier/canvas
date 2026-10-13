// The state washes a pane's under-fill takes under glass: a field's error and a selected
// card. Each is a colour role at a ceiling alpha, laid over the pane's own body (a clear
// field's veil, a control puck's or a content pane's layer tint) and capped at the densest
// alpha at which the ink the skin paints on it, the same `muted-foreground` and `foreground`
// as in solid mode, keeps WCAG 4.5:1 over the page and over a content pane (the owner's GP-2
// decision, audit/DECISIONS.md), on the wash itself and on the inner fill a field's addon or
// country segment paints over it. That leaves almost no error wash in any palette, as solid's
// web field has none. The selection wash's ceiling is the solid recipe's own tint, so a
// selected card under glass paints the soft tint it paints in solid, in every palette, the
// dark one included (the owner's GP-2b decision). The state is carried by the error border,
// the message and the selected border, as in solid and in Dark Factory.
//
// This table is the only place the washes' numbers live, apart from the selection ceiling it
// reads from the solid recipe (src/style/selected-card.ts): a tuning-harness tunable
// (.tuning-harness.json, both files), judged on /testing/materials and the shipped pages, its
// runs logged in tools/native/liquid-motion.md. test/glass-controls.test.tsx holds the floors.

import type { ThemeValue } from "../theme.js";
import { alpha, channelsOf, composite, contrastRatio } from "../color.js";
import { innerFill } from "../glass-fill.js";
import { SELECTED_CARD_TINT } from "../selected-card.js";
import { clearSurfaceTint, surfaceUnderFill, type GlassLayer } from "./glass-surface.shared.js";

export const GLASS_WASH = {
  /**
   * A field in its error state (Input, Textarea, PhoneInput): the destructive colour. A
   * field's prefix or suffix addon and PhoneInput's country segment paint a `soft` inner
   * fill over the wash, under the same muted ink, so the ink is held on that fill too.
   */
  error: { token: "destructive", ceiling: 0.18, inner: "soft" },
  /**
   * A selected card (a selected Card, a checked Radio card): the primary colour, under no
   * inner fill, never denser than the solid recipe's own selected tint (`SELECTED_CARD_TINT`,
   * read from it rather than copied), so the glass card paints what the solid one does.
   */
  selection: { token: "primary", ceiling: SELECTED_CARD_TINT, inner: null },
  /** The contrast the muted and foreground inks keep on a wash: WCAG AA for normal-size text. */
  inkContrast: 4.5,
  /**
   * The headroom the cap is solved with above `inkContrast`. The material samples the real
   * backdrop, which runs a little lighter or darker than the page token the cap is solved
   * on: on the shipped pages a wash solved to exactly 4.5:1 measured 4.47:1 (the errored
   * field's prefix on its addon, dark glass), so the cap is solved at 4.5 plus this.
   */
  headroom: 0.1,
  /** The step the cap is searched in, from the ceiling down. */
  step: 0.01,
} as const;

/** A state wash of the glass model: `error` or `selection`. */
export type GlassWash = "error" | "selection";

/** The pane a wash lies in: its layer, and whether it is a clear (unfrosted) field. */
export interface WashPane {
  layer?: GlassLayer;
  clear?: boolean;
}

/** `top` over `under`, both translucent: the one colour the two paint together. */
function over(top: string, under: string): string {
  const t = channelsOf(top);
  const u = channelsOf(under);
  if (!t || !u) return top;
  const a = t[3] + u[3] * (1 - t[3]);
  if (a <= 0) return "rgba(0, 0, 0, 0)";
  const channel = (i: number) => Math.round((t[i]! * t[3] + u[i]! * u[3] * (1 - t[3])) / a);
  return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${Math.round(a * 1000) / 1000})`;
}

/**
 * The under-fill of a pane showing a state wash, legible by construction: the wash's colour
 * over the pane's own body, at the densest alpha up to its ceiling at which the muted and
 * foreground inks keep 4.5:1 composited on the page and on a content pane, and on the wash's
 * inner fill where one is painted over it. Where even the body alone misses that floor (the
 * layer's own legibility, not the wash's), it is the body.
 */
export function legibleWash(theme: Pick<ThemeValue, "tokens" | "glass" | "dark">, wash: GlassWash, pane: WashPane = {}): string {
  const { tokens, glass, dark } = theme;
  const { token, ceiling, inner } = GLASS_WASH[wash];
  const body = pane.clear ? clearSurfaceTint(tokens, dark) : surfaceUnderFill(glass, pane.layer ?? "control");
  const bases = [tokens.background, composite(glass["glass-tint-content"], tokens.background)];
  const inks = [tokens["muted-foreground"], tokens.foreground];
  const fillOver = inner ? innerFill({ tokens, dark, surface: "glass" }, "muted", inner) : null;
  const beds = (fill: string) => bases.flatMap((base) => {
    const bed = composite(fill, base);
    return fillOver ? [bed, composite(fillOver, bed)] : [bed];
  });
  for (let steps = Math.round(ceiling / GLASS_WASH.step); steps > 0; steps--) {
    const fill = over(alpha(tokens[token], Math.round(steps * GLASS_WASH.step * 100) / 100), body);
    if (beds(fill).every((bed) => inks.every((ink) => contrastRatio(bed, ink) >= GLASS_WASH.inkContrast + GLASS_WASH.headroom))) return fill;
  }
  return body;
}
