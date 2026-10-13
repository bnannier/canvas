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
// A soft inner fill that carries ink is capped the same way (the owner's GS-2 decision): a
// field's prefix or suffix addon and PhoneInput's country segment paint an ink tint over the
// field's body under the same muted ink, and the tint takes the densest alpha up to its own
// strength at which that ink keeps 4.5:1 plus the headroom on the body of the host that
// renders it (`legibleInnerFill`).
//
// The off Switch's track is the third under-fill here (the owner's GS-1 decision): its solid
// off-track fill as a neutral pane, as a checked track takes its brand, at the sheerest alpha
// at which the track keeps the 3:1 WCAG 1.4.11 asks of a control's boundary against what lies
// around it and under its thumb (`GLASS_TRACK`, `legibleTrack`).
//
// These tables are the only place the under-fills' numbers live, apart from the selection
// ceiling read from the solid recipe (src/style/selected-card.ts): tuning-harness tunables
// (.tuning-harness.json, both files), judged on /testing/materials and the shipped pages, their
// runs logged in tools/native/liquid-motion.md. test/glass-controls.test.tsx holds the floors.

import type { ThemeValue } from "../theme.js";
import { alpha, channelsOf, composite, contrastRatio } from "../color.js";
import { innerFill, innerFillAlpha, type InnerFillStrength } from "../glass-fill.js";
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

/** The two grounds a glass surface is legible over: the page, and a content pane on it. */
function grounds(theme: Pick<ThemeValue, "tokens" | "glass">): string[] {
  return [theme.tokens.background, composite(theme.glass["glass-tint-content"], theme.tokens.background)];
}

/** A pane's own body under glass: a clear field's veil, or its layer's tint. */
function paneBody(theme: Pick<ThemeValue, "tokens" | "glass" | "dark">, pane: WashPane): string {
  return pane.clear ? clearSurfaceTint(theme.tokens, theme.dark) : surfaceUnderFill(theme.glass, pane.layer ?? "control");
}

/**
 * The densest tint of `token`, from `ceiling` down in `GLASS_WASH.step`s, on whose `beds` the
 * muted and foreground inks keep `GLASS_WASH.inkContrast` plus the headroom; null where none does.
 */
function densestLegible(tokens: ThemeValue["tokens"], token: "destructive" | "primary" | "foreground", ceiling: number, beds: (tint: string) => string[]): string | null {
  const inks = [tokens["muted-foreground"], tokens.foreground];
  for (let steps = Math.round(ceiling / GLASS_WASH.step); steps > 0; steps--) {
    const tint = alpha(tokens[token], Math.round(steps * GLASS_WASH.step * 100) / 100);
    if (beds(tint).every((bed) => inks.every((ink) => contrastRatio(bed, ink) >= GLASS_WASH.inkContrast + GLASS_WASH.headroom))) return tint;
  }
  return null;
}

/**
 * The under-fill of a pane showing a state wash, legible by construction: the wash's colour
 * over the pane's own body, at the densest alpha up to its ceiling at which the muted and
 * foreground inks keep 4.5:1 composited on the page and on a content pane, and on the wash's
 * inner fill where one is painted over it. Where even the body alone misses that floor (the
 * layer's own legibility, not the wash's), it is the body.
 */
export function legibleWash(theme: Pick<ThemeValue, "tokens" | "glass" | "dark">, wash: GlassWash, pane: WashPane = {}): string {
  const { tokens, dark } = theme;
  const { token, ceiling, inner } = GLASS_WASH[wash];
  const body = paneBody(theme, pane);
  const bases = grounds(theme);
  const fillOver = inner ? innerFill({ tokens, dark, surface: "glass" }, "muted", inner) : null;
  const tint = densestLegible(tokens, token, ceiling, (tone) => bases.flatMap((base) => {
    const bed = composite(over(tone, body), base);
    return fillOver ? [bed, composite(fillOver, bed)] : [bed];
  }));
  return tint == null ? body : over(tint, body);
}

export const GLASS_TRACK = {
  /** The contrast an off track keeps against the page or pane around it, and its thumb against it: WCAG 1.4.11's 3:1. */
  boundaryContrast: 3,
  /** The headroom the alpha is solved with above `boundaryContrast`, for the same reason as `GLASS_WASH.headroom`. */
  headroom: 0.1,
  /** The sheerest alpha tried, a brand-tinted puck's own floor (`BRAND_TINT_ALPHA`), and the step up from it. */
  floor: 0.66,
  step: 0.02,
} as const;

/**
 * The under-fill of an off Switch's track under glass: the skin's own off-track `fill` at the
 * sheerest alpha from `GLASS_TRACK.floor` at which the track, composited on the page and on a
 * content pane, keeps 3:1 against that ground and the `thumb` keeps 3:1 against it. Where no
 * alpha clears that (the iOS systemGray3 track, which Apple keeps under 3:1 in solid too, and
 * Android's muted track, whose thumb carries the control), it is the opaque fill itself, the
 * solid track.
 */
export function legibleTrack(theme: Pick<ThemeValue, "tokens" | "glass">, fill: string, thumb: string): string {
  const around = grounds(theme);
  const bar = GLASS_TRACK.boundaryContrast + GLASS_TRACK.headroom;
  for (let a = GLASS_TRACK.floor; a < 1; a += GLASS_TRACK.step) {
    const under = alpha(fill, Math.round(a * 100) / 100);
    if (around.every((ground) => {
      const track = composite(under, ground);
      return contrastRatio(track, ground) >= bar && contrastRatio(track, thumb) >= bar;
    })) return under;
  }
  return fill;
}

/**
 * The ink tint a soft inner fill that carries text paints under glass (a field's prefix or
 * suffix addon, PhoneInput's country segment), capped for legibility like a wash (the
 * owner's GS-2 decision): `innerFill`'s tint at the densest alpha up to the strength's own at
 * which the muted and foreground inks keep 4.5:1 plus `GLASS_WASH.headroom`, laid over the
 * pane's body (a clear field's veil, or the control layer's puck) composited on the page and
 * on a content pane. A thinner tint of the ink only ever raises the ink's contrast, so the
 * fill keeps its full strength wherever that already holds, and where even the body alone
 * misses the floor it is no fill at all.
 *
 * The body is the tints the browser composites as they are, so this is the web host's
 * answer (a host whose frost adds no colour of its own: Dark Factory's plain frost). A native
 * frost paints its own scheme material over the pane's under-fill, which the tints do not
 * predict (on the iOS device a dark field's body is #272730 and its addon's `$` reads 4.76:1
 * at the full strength, where the tints alone would put it at 3.33), so a native host keeps
 * the strength (`useTextEntryMaterial`).
 */
export function legibleInnerFill(theme: Pick<ThemeValue, "tokens" | "glass" | "dark">, pane: WashPane = {}, strength: InnerFillStrength = "soft"): string {
  const body = paneBody(theme, pane);
  const beds = grounds(theme).map((ground) => composite(body, ground));
  return densestLegible(theme.tokens, "foreground", innerFillAlpha(theme, strength), (tint) => beds.map((bed) => composite(tint, bed))) ?? alpha(theme.tokens.foreground, 0);
}
