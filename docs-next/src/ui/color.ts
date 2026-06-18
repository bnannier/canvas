// The Vite landing leans on CSS `color-mix(... N%, transparent)` for its tinted chips,
// badges, and washes. The Canvas tokens are plain 6-digit hex, so this turns a hex token
// into an rgba() string at the given alpha — the RN-safe equivalent of mixing toward
// transparent. (Mixing toward another color is done per-call where needed.)
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Convert an HSL color to a 6-digit hex string. Pure math (no DOM, RN-safe), so
// the chart/accent palettes (authored as HSL on the colors page) can show the
// hex they resolve to alongside the HSL. h in degrees, s/l in percent.
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert a CSS HSL triplet string ("12 76% 61%") to hex — the shape the chart
// palette stores its values in.
export function hslTripletToHex(triplet: string): string {
  const [h, s, l] = triplet.replace(/%/g, "").trim().split(/\s+/).map(Number);
  return hslToHex(h, s, l);
}

// Pick black or white for a label sitting on top of a hex fill, using the WCAG
// relative-luminance crossover (~0.179) where black and white read equally well.
// Lets the L/D markers on a split swatch stay legible on any color.
export function readableText(hex: string): string {
  const lum =
    0.2126 * srgbToLinear(parseInt(hex.replace("#", "").slice(0, 2), 16)) +
    0.7152 * srgbToLinear(parseInt(hex.replace("#", "").slice(2, 4), 16)) +
    0.0722 * srgbToLinear(parseInt(hex.replace("#", "").slice(4, 6), 16));
  return lum > 0.179 ? "#000000" : "#ffffff";
}

// --- Format conversions for the token reference ------------------------------
// The colors page derives every notation from the one hex a swatch actually
// renders, so the hex/hsl/oklch shown always describe the same pixel and never
// drift apart. All pure math (no DOM), so it runs identically on native and web.

function rgb255(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Hex → CSS `hsl(H S% L%)` string.
export function hexToHslString(hex: string): string {
  const [r, g, b] = rgb255(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

// Hex → CSS `oklch(L C H)` string, via Björn Ottosson's sRGB → OKLab transform.
export function hexToOklchString(hex: string): string {
  const [r, g, b] = rgb255(hex).map(srgbToLinear);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = Math.atan2(bb, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  // Hue is undefined for achromatic colors; report 0 once chroma rounds to 0.000.
  const hue = C < 0.0005 ? 0 : Math.round(H);
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${hue})`;
}

// Wrap a hex string as `hex(#rrggbb)` so it lines up with the hsl()/oklch()/rgba()
// function syntax used elsewhere on the colors page. `hex()` is a display convention
// here, not a real CSS function. Non-hex values (e.g. an rgba() fill) pass through
// unchanged so a mixed list stays uniform.
export function wrapHex(value: string): string {
  return value.startsWith("#") ? `hex(${value})` : value;
}

// All three notations for a single rendered hex, derived from that hex so they are
// always mutually consistent. Returned in display order: hex, hsl, oklch.
export function colorFormats(hex: string): string[] {
  return [wrapHex(hex), hexToHslString(hex), hexToOklchString(hex)];
}
