export function token(name: string): string {
  // Web-only helper (reads the CSS variable off the DOM). Guarded so importing
  // the barrel never touches DOM globals on native or during SSR.
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

export function hsl(name: string, alpha?: number): string {
  const raw = token(name);
  if (alpha !== undefined) {
    return `hsl(${raw} / ${alpha})`;
  }
  return `hsl(${raw})`;
}
