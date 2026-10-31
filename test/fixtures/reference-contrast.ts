import { expect } from "bun:test";

/**
 * D14 preserves the hand-off's colors even where they miss a WCAG floor. Record exact
 * composed contrast as regression evidence, alongside the intended floor and its result.
 * CANVAS_AUDIT_CONTRAST=1 additionally enforces that floor for an explicit WCAG audit.
 * Token/source fidelity is independently held by v4-color-parity.test.ts.
 */
export function referenceContrast(label: string, ratios: readonly number[], floor: number): void {
  expect(ratios.length).toBeGreaterThan(0);
  const minimum = Math.min(...ratios);
  if (minimum >= floor || process.env.CANVAS_AUDIT_CONTRAST === "1") {
    expect(minimum, label).toBeGreaterThanOrEqual(floor);
  } else {
    expect({ minimum: Number(minimum.toFixed(4)), floor, passes: false }).toMatchSnapshot(label);
  }
}
