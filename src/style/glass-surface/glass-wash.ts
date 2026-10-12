// The state washes a pane's under-fill takes under glass: a field's error and a selected
// card. Each is a colour role at a ceiling alpha, laid over the pane's own body (a clear
// field's veil, a control puck's or a content pane's layer tint) and capped at the densest
// alpha at which the ink the skin paints on it, the same `muted-foreground` and `foreground`
// as in solid mode, keeps WCAG 4.5:1 over the page and over a content pane (the owner's GP-2
// decision, audit/DECISIONS.md). In the light palettes that leaves almost no wash, so the
// state is carried by the error border, the message and the control's own indicator, as in
// solid and in Dark Factory; the dark palette keeps a visible wash.
//
// This table is the only place the washes' numbers live: a tuning-harness tunable
// (.tuning-harness.json), judged on /testing/materials and the shipped pages, its runs
// logged in tools/native/liquid-motion.md. test/glass-controls.test.tsx holds the floors.

import type { ThemeValue } from "../theme.js";
import { alpha, channelsOf, composite, contrastRatio } from "../color.js";
import { clearSurfaceTint, surfaceUnderFill, type GlassLayer } from "./glass-surface.shared.js";

export const GLASS_WASH = {
  /** A field in its error state (Input, Textarea, PhoneInput): the destructive colour. */
  error: { token: "destructive", ceiling: 0.18 },
  /** A selected card (a selected Card, a checked Radio card): the primary colour. */
  selection: { token: "primary", ceiling: 0.22 },
  /** The contrast the muted and foreground inks keep on a wash. */
  inkContrast: 4.5,
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
 * foreground inks keep 4.5:1 composited on the page and on a content pane. Where even the
 * body alone misses that floor (the layer's own legibility, not the wash's), it is the body.
 */
export function legibleWash(theme: Pick<ThemeValue, "tokens" | "glass" | "dark">, wash: GlassWash, pane: WashPane = {}): string {
  const { tokens, glass, dark } = theme;
  const { token, ceiling } = GLASS_WASH[wash];
  const body = pane.clear ? clearSurfaceTint(tokens, dark) : surfaceUnderFill(glass, pane.layer ?? "control");
  const bases = [tokens.background, composite(glass["glass-tint-content"], tokens.background)];
  const inks = [tokens["muted-foreground"], tokens.foreground];
  for (let steps = Math.round(ceiling / GLASS_WASH.step); steps > 0; steps--) {
    const fill = over(alpha(tokens[token], Math.round(steps * GLASS_WASH.step * 100) / 100), body);
    if (bases.every((base) => inks.every((ink) => contrastRatio(composite(fill, base), ink) >= GLASS_WASH.inkContrast))) return fill;
  }
  return body;
}
