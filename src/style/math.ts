// Small numeric helpers shared across components (so the same one-liner is not
// re-declared in every slider / stepper / progress).

/** Clamp `v` to the inclusive `[lo, hi]` range. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
