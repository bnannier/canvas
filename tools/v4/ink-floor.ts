import { channelsOf, oklchHex, oklchOf } from "../../src/style/color.ts";

// The legibility floor for a text ink the hand-off authors below it. The v4 hand-off picks
// its accent text, status inks and inverse action by eye; on some hues and washes they
// read under WCAG 1.4.3's 4.5:1. A role keeps its job (audit/v4-redesign/PLAN.md, D2), so
// the token table walks such an ink's oklch lightness away from its beds, holding the
// authored hue, until every bed it is drawn on clears the floor. An ink that already
// clears it is returned unchanged, so a passing hand-off value is never moved. A walked
// ink takes the most chroma the sRGB gamut allows at its lightness, up to the authored
// chroma, instead of clipping channels: clipping a dark amber or a light cyan swings its
// hue toward the neighbouring palette's, and the palette must stay recognisably its own.
//
// A bed is what the ink is read against as the renderer paints it: an opaque surface with
// translucent layers over it, a whole group dimmed over its parent (iOS's pressed capsule),
// or text at a hover opacity. Layers blend exactly, as a compositor does, and each bed is
// checked at its exact value AND through the one-channel rounding neighbourhood a renderer
// may land on, so the floor holds on every platform.

/** One place an ink is read. */
export interface InkBed {
  /** The opaque surface at the bottom. */
  under: string;
  /** Translucent fills painted over `under`, bottom first (a wash, a band, a tint). */
  layers?: readonly string[];
  /** A group opacity applied to the text and its layers together, over `under` (a pressed iOS capsule). */
  dim?: number;
  /** An opacity applied to the text alone (an anchor's hover). */
  textOpacity?: number;
}

/** What the ink must clear on a bed: the exact ratio, and the ratio through ±1 channel rounding. */
export interface InkFloor {
  exact: number;
  rounded: number;
}

/** WCAG 1.4.3's body-text floor, with the rounding neighbourhood held to the same 4.5. */
export const TEXT_FLOOR: InkFloor = { exact: 4.5, rounded: 4.5 };

type Rgb = readonly [number, number, number];

const toLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

function rgbOf(color: string): Rgb {
  const c = channelsOf(color);
  if (!c) throw new Error(`ink-floor: ${color} is not a colour`);
  return [c[0], c[1], c[2]];
}

/** `over` (with its own alpha, times `opacity`) blended exactly onto the opaque `base`. */
function blend(over: string, base: Rgb, opacity = 1): Rgb {
  const c = channelsOf(over);
  if (!c) throw new Error(`ink-floor: ${over} is not a colour`);
  const a = c[3] * opacity;
  return [0, 1, 2].map((k) => c[k]! * a + base[k]! * (1 - a)) as unknown as Rgb;
}

/** The text and surface colours a bed resolves to for `ink`, unrounded. */
function paintBed(ink: string, bed: InkBed): [text: Rgb, surface: Rgb] {
  const under = rgbOf(bed.under);
  const dim = bed.dim ?? 1;
  let surface: Rgb = under;
  for (const layer of bed.layers ?? []) surface = blend(layer, surface);
  let text = blend(ink, surface, bed.textOpacity ?? 1);
  if (dim !== 1) {
    // A dimmed group composites once onto its parent: the text over the dimmed surface.
    const dimmedSurface = [0, 1, 2].map((k) => surface[k]! * dim + under[k]! * (1 - dim)) as unknown as Rgb;
    text = [0, 1, 2].map((k) => text[k]! * dim + under[k]! * (1 - dim)) as unknown as Rgb;
    surface = dimmedSurface;
  }
  return [text, surface];
}

const clamp = (v: number) => Math.max(0, Math.min(255, v));

/** The lowest contrast through ±1-channel rounding of both colours. */
function roundedRatio(text: Rgb, surface: Rgb): number {
  // Contrast is monotone in each channel, so the worst pair moves every channel of the
  // darker colour up and of the lighter one down, from each colour's rounded value.
  const d = luminance(text) < luminance(surface) ? 1 : -1;
  const shift = (c: Rgb, by: number) => c.map((v) => clamp(Math.round(v) + by)) as unknown as Rgb;
  return ratio(shift(text, d), shift(surface, -d));
}

/** Whether `ink` clears `floor` on every bed. */
export function clearsFloor(ink: string, beds: readonly InkBed[], floor: InkFloor = TEXT_FLOOR): boolean {
  return beds.every((bed) => {
    const [text, surface] = paintBed(ink, bed);
    return ratio(text, surface) >= floor.exact && roundedRatio(text, surface) >= floor.rounded;
  });
}

/** Whether oklch(L C H) is inside sRGB: its hex reads back at the same lightness, chroma and hue. */
function inGamut(L: number, C: number, H: number): boolean {
  const back = oklchOf(oklchHex(L, C, H));
  if (!back) return false;
  const dh = Math.abs(((back[2] - H + 540) % 360) - 180);
  return Math.abs(back[0] - L) < 0.004 && Math.abs(back[1] - C) < 0.004 && (C < 0.02 || dh < 1.5);
}

/** The most chroma up to `C` that oklch at `L` and `H` holds inside sRGB. */
function gamutChroma(L: number, C: number, H: number): number {
  if (inGamut(L, C, H)) return C;
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, H)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** The oklch lightness step the walk takes: fine enough that a solved ink sits at most this far past its floor. */
const STEP = 0.0025;

/**
 * The authored ink at `[L, C, H]` (clipped to sRGB the way a browser paints the hand-off's
 * oklch), or, when it misses `floor` on a bed, the same hue at the nearest lightness that
 * clears every bed: darker when `toward` is "dark" (a light scheme), lighter when "light",
 * at the most in-gamut chroma up to the authored one. Throws when no lightness clears the
 * floor, so an impossible bed set fails at module load instead of shipping an unreadable ink.
 */
export function solveInk([L, C, H]: readonly [number, number, number], beds: readonly InkBed[], toward: "dark" | "light", floor: InkFloor = TEXT_FLOOR): string {
  const authored = oklchHex(L, C, H);
  if (clearsFloor(authored, beds, floor)) return authored;
  const step = toward === "dark" ? -STEP : STEP;
  for (let l = L + step; l >= 0 && l <= 1; l += step) {
    const ink = oklchHex(l, gamutChroma(l, C, H), H);
    if (clearsFloor(ink, beds, floor)) return ink;
  }
  throw new Error(`ink-floor: no ${toward} lightness from oklch(${L} ${C} ${H}) clears ${floor.exact}:1 on every bed`);
}

/** `solveInk` for an authored hex ink: its own oklch is the starting point. */
export function solveHexInk(hex: string, beds: readonly InkBed[], toward: "dark" | "light", floor: InkFloor = TEXT_FLOOR): string {
  if (clearsFloor(hex, beds, floor)) return hex;
  const lch = oklchOf(hex);
  if (!lch) throw new Error(`ink-floor: ${hex} is not opaque hex`);
  return solveInk(lch, beds, toward, floor);
}

