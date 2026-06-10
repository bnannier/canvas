// Color helpers for building style objects from tokens.

/**
 * Apply an alpha to a hex color, returning an `rgba(...)` string. Replaces the
 * engine's `bg-primary/10`-style alpha suffix: `alpha(tokens.primary, 0.1)`.
 * `a` is a 0..1 fraction. Non-hex inputs (already-translucent token values,
 * "transparent") are returned unchanged so callers can pass any token safely.
 */
export function alpha(color: string, a: number): string {
  if (color === "transparent" || color[0] !== "#") return color;
  const h = color.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
