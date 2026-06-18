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
