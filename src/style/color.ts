// Color helpers for building style objects from tokens.

/**
 * Apply an alpha to a hex color, returning an `rgba(...)` string. Replaces the
 * engine's `bg-primary/10`-style alpha suffix: `alpha(tokens.primary, 0.1)`.
 * Accepts #rgb, #rgba, #rrggbb and #rrggbbaa. The supplied opacity replaces any
 * existing hex alpha. Finite opacity is clamped to 0..1. Invalid hex, non-finite
 * opacity and non-hex inputs (including rgba() and "transparent") pass through.
 */
export function alpha(color: string, a: number): string {
  if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(color) || !Number.isFinite(a)) return color;
  const h = color.slice(1);
  const full = h.length <= 4 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
}

// --- Oklab mixing -----------------------------------------------------------
// The web hand-off writes its blended fills as `color-mix(in oklab, <over> <n>%,
// <base>)`. Oklab is a perceptual space, so the mix is NOT a channel-wise sRGB
// lerp: it decodes both colours to linear light, converts to Oklab, interpolates
// there, and converts back. Doing it in sRGB instead lands a visibly different
// value (2/255 per channel at the 6% weight the identity pill uses), so native
// gets the real transform here rather than an approximation of it.
//
// The matrices are Björn Ottosson's reference Oklab conversion.

/** sRGB 0..255 channel -> linear-light 0..1. */
function toLinear(v: number): number {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/** Linear-light 0..1 -> sRGB 0..255, clamped to the displayable range. */
function toSrgb(x: number): number {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

/** `#rgb` / `#rrggbb` -> the three sRGB channels, or null when it is not a hex colour. */
function hexChannels(color: string): [number, number, number] | null {
  if (color[0] !== "#") return null;
  const h = color.slice(1);
  if (h.length !== 3 && h.length !== 6) return null;
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** sRGB channels -> Oklab L, a, b. */
function oklabOf([r, g, b]: [number, number, number]): [number, number, number] {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Oklab L, a, b -> sRGB channels. */
function srgbOf([L, a, b]: [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/**
 * An `oklch(L C h)` colour as the `#rrggbb` a browser paints for it: Oklab to linear sRGB,
 * then each channel clipped to the displayable range, which is what Chrome renders for the
 * v4 hand-off's accents (tools/v4/accent-samples.json). The accent palettes are authored in
 * oklch and React Native cannot parse it, so the kit converts here.
 */
export function oklchHex(L: number, C: number, hueDeg: number): string {
  const h = (hueDeg * Math.PI) / 180;
  const [r, g, b] = srgbOf([L, C * Math.cos(h), C * Math.sin(h)]);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * A colour's oklch lightness, chroma and hue (degrees, 0..360), the inverse of `oklchHex`, or
 * null when it is not opaque #rgb or #rrggbb hex. The token gates read a neutral's tint
 * with it: a hand-off neutral is hex, and its hue and chroma say which family it is in.
 */
export function oklchOf(color: string): [number, number, number] | null {
  const ch = hexChannels(color);
  if (!ch) return null;
  const [L, a, b] = oklabOf(ch);
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), hue < 0 ? hue + 360 : hue];
}

/**
 * Blend `over` into `base` by `t` (a 0..1 fraction) in the Oklab space, returning
 * an `rgb(...)` string. The RN equivalent of the hand-off's
 * `color-mix(in oklab, <over> <t*100>%, <base>)`, matching it channel for channel,
 * so a skin can transcribe a blended CSS fill without a web colour function.
 *
 * Both colours must be opaque #rgb or #rrggbb hex (the default token shape).
 * Translucent hex (#rgba or #rrggbbaa), functional colors and "transparent"
 * return `base` unchanged. This helper does not discard or blend source alpha.
 */
export function mixOklab(base: string, over: string, t: number): string {
  const from = hexChannels(base);
  const to = hexChannels(over);
  if (!from || !to) return base;
  const a = oklabOf(from);
  const b = oklabOf(to);
  const [r, g, bl] = srgbOf([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
  return `rgb(${r}, ${g}, ${bl})`;
}

// The chroma under which Chrome gives a colour converted from hex no hue of its own.
const ACHROMATIC_CHROMA = 0.02;

/**
 * Blend `over` into `base` by `t` (a 0..1 fraction) in OKLCH, returning `#rrggbb`: the RN
 * equivalent of the hand-off's `color-mix(in oklch, <over> <t*100>%, <base>)`. Lightness and
 * chroma blend linearly and the hue along the shorter arc. A near-grey has no hue of its own
 * and takes the other's, as Chrome treats a hex colour whose chroma is under 0.02 (measured
 * against its `color-mix`: 0.0196 has no hue, 0.0204 keeps its own). Both colours must be
 * opaque hex; otherwise `base` comes back unchanged.
 */
export function mixOklch(base: string, over: string, t: number): string {
  const a = oklchOf(base);
  const b = oklchOf(over);
  if (!a || !b) return base;
  const powerless = (c: number) => c < ACHROMATIC_CHROMA;
  const ha = powerless(a[1]) ? b[2] : a[2];
  const hb = powerless(b[1]) ? a[2] : b[2];
  const turn = ((hb - ha + 540) % 360) - 180;
  return oklchHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (ha + turn * t + 360) % 360);
}

// --- WCAG contrast -----------------------------------------------------------
// The kit tunes its translucent fills (the brand-tinted glass puck) against the ink
// they carry, so the legibility floor is computed where the fill is chosen rather than
// pinned by hand per token. `rgba(...)`, `rgb(...)` and hex all parse; anything else
// (a "transparent", a named colour) yields null and the caller keeps its default.

/** A colour's sRGB channels and alpha, or null when it is not a hex or rgb(a) string. */
export function channelsOf(color: string): [number, number, number, number] | null {
  const hex = hexChannels(color);
  if (hex) return [hex[0], hex[1], hex[2], 1];
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(color.trim());
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] == null ? 1 : Number(m[4])];
}

/** `tint` composited over the opaque `base` (source-over), as an `rgb(...)` string. */
export function composite(tint: string, base: string): string {
  const t = channelsOf(tint);
  const b = channelsOf(base);
  if (!t || !b) return base;
  const a = t[3];
  const ch = (x: number, y: number) => Math.round(x * a + y * (1 - a));
  return `rgb(${ch(t[0], b[0])}, ${ch(t[1], b[1])}, ${ch(t[2], b[2])})`;
}

/** WCAG 2 relative luminance of an opaque colour (alpha is ignored). */
export function relativeLuminance(color: string): number {
  const c = channelsOf(color);
  if (!c) return 0;
  return 0.2126 * toLinear(c[0]) + 0.7152 * toLinear(c[1]) + 0.0722 * toLinear(c[2]);
}

/** WCAG 2 contrast ratio between two opaque colours (1 when either does not parse). */
export function contrastRatio(a: string, b: string): number {
  if (!channelsOf(a) || !channelsOf(b)) return 1;
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The WCAG 2 contrast of `ink` on `tint` composited over the opaque `base`: the lower of the
 * exact blend's and `composite`'s rounded channels', so a floor solved with it holds whichever
 * way a renderer resolves the blend (1 when a colour does not parse).
 */
export function contrastOver(tint: string, base: string, ink: string): number {
  const t = channelsOf(tint);
  const b = channelsOf(base);
  const i = channelsOf(ink);
  if (!t || !b || !i) return 1;
  const a = t[3];
  const lum = ([r, g, bl]: readonly number[]) => 0.2126 * toLinear(r!) + 0.7152 * toLinear(g!) + 0.0722 * toLinear(bl!);
  const [hi, lo] = [lum([0, 1, 2].map((k) => t[k]! * a + b[k]! * (1 - a))), lum(i)].sort((x, y) => y - x);
  return Math.min((hi! + 0.05) / (lo! + 0.05), contrastRatio(composite(tint, base), ink));
}

/** The ink a colour carries best: white or near-black, whichever contrasts more. */
export function inkOn(color: string): string {
  return contrastRatio("#ffffff", color) >= contrastRatio("#0a0a0a", color) ? "#ffffff" : "#0a0a0a";
}
