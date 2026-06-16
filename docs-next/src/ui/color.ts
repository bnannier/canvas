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
