export function token(name: string): string {
  // Web-only helper (reads the CSS variable off the DOM). Guarded so importing
  // the barrel never touches DOM globals on native or during SSR.
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

/**
 * A token as a complete CSS colour, optionally translucent.
 *
 * The name is historical: tokens used to be bare HSL triplets that a caller had
 * to wrap. They are now complete colours (oklch for the scheme pairs, hex for
 * the fixed brand and chart constants), so wrapping them in `hsl()` would emit
 * `hsl(oklch(...))`, which is invalid in every browser. The value passes
 * through untouched, and alpha is applied the same way the token layer does it.
 */
export function hsl(name: string, alpha?: number): string {
  const raw = token(name);
  if (!raw) return "";
  if (alpha === undefined) return raw;
  return `color-mix(in oklab, ${raw} ${Math.round(alpha * 100)}%, transparent)`;
}
