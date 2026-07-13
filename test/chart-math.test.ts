import { describe, it, expect } from "bun:test";
import {
  arcPath,
  cumulativeDepth,
  stepAreaPath,
  areaBandPath,
  areaPath,
  bandScale,
  estimateTextWidth,
  formatCompact,
  linePath,
  linearScale,
  monotonePath,
  niceTicks,
  pieLayout,
  stackSeries,
} from "../src/organisms/charts/chart-math.ts";

describe("linearScale", () => {
  it("maps the domain onto the range linearly", () => {
    const s = linearScale(0, 100, 0, 200);
    expect(s(0)).toBe(0);
    expect(s(50)).toBe(100);
    expect(s(100)).toBe(200);
  });

  it("supports inverted ranges (value up, pixel down)", () => {
    const s = linearScale(0, 10, 140, 0);
    expect(s(0)).toBe(140);
    expect(s(10)).toBe(0);
  });

  it("maps a degenerate domain to the range midpoint", () => {
    const s = linearScale(5, 5, 0, 100);
    expect(s(5)).toBe(50);
    expect(s(999)).toBe(50);
  });
});

describe("bandScale", () => {
  it("divides the range into equal bands with inner padding", () => {
    const b = bandScale(4, 0, 100, 0.2, 0.1);
    expect(b.position(0)).toBeGreaterThan(0);
    expect(b.position(3) + b.bandWidth).toBeLessThanOrEqual(100.0001);
    // Steps are uniform.
    expect(b.position(1) - b.position(0)).toBeCloseTo(b.step);
    expect(b.bandWidth).toBeCloseTo(b.step * 0.8);
  });

  it("zero padding yields edge-to-edge bands with centered midpoints", () => {
    const b = bandScale(4, 0, 100, 0, 0);
    expect(b.position(0)).toBe(0);
    expect(b.step).toBe(25);
    expect(b.center(0)).toBe(12.5);
    expect(b.center(3)).toBe(87.5);
  });
});

describe("niceTicks", () => {
  it("produces 1/2/5-step ticks spanning the data", () => {
    const { ticks, niceMin, niceMax } = niceTicks(0, 95, 5);
    expect(niceMin).toBe(0);
    expect(niceMax).toBeGreaterThanOrEqual(95);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    const step = ticks[1] - ticks[0];
    for (let i = 2; i < ticks.length; i++) expect(ticks[i] - ticks[i - 1]).toBeCloseTo(step);
  });

  it("handles a flat domain without collapsing", () => {
    const { ticks, niceMin, niceMax } = niceTicks(50, 50, 5);
    expect(niceMin).toBeLessThan(50);
    expect(niceMax).toBeGreaterThan(50);
    expect(ticks.length).toBeGreaterThan(1);
  });

  it("emits clean fractional ticks (no float debris)", () => {
    const { ticks } = niceTicks(0, 1, 5);
    for (const t of ticks) expect(String(t).length).toBeLessThanOrEqual(4);
  });

  it("tolerates non-finite input", () => {
    const { ticks } = niceTicks(NaN, Infinity, 5);
    expect(ticks.length).toBeGreaterThan(0);
  });
});

describe("line and area paths", () => {
  const pts = [
    { x: 0, y: 100 },
    { x: 50, y: 20 },
    { x: 100, y: 60 },
  ];

  it("linePath emits M/L segments through every point", () => {
    expect(linePath(pts)).toBe("M0,100 L50,20 L100,60");
    expect(linePath([])).toBe("");
  });

  it("monotonePath starts and ends exactly on the data", () => {
    const d = monotonePath(pts);
    expect(d.startsWith("M0,100")).toBe(true);
    expect(d.endsWith("100,60")).toBe(true);
    expect(d).toContain("C"); // curved, not straight
  });

  it("monotonePath falls back to a line for two points", () => {
    expect(monotonePath(pts.slice(0, 2))).toBe("M0,100 L50,20");
  });

  it("monotone control points never overshoot a peak", () => {
    // Peak at the middle point: control-point y values must stay >= the peak y
    // (SVG y grows downward, peak is the minimum).
    const peak = [
      { x: 0, y: 100 },
      { x: 50, y: 10 },
      { x: 100, y: 100 },
    ];
    const d = monotonePath(peak);
    const ys = [...d.matchAll(/[C ](-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]));
    for (const y of ys) expect(y).toBeGreaterThanOrEqual(10);
  });

  it("areaPath closes to the baseline", () => {
    const d = areaPath(pts, 140);
    expect(d).toContain("L100,140");
    expect(d).toContain("L0,140");
    expect(d.endsWith("Z")).toBe(true);
  });

  it("areaBandPath rings top and reversed bottom", () => {
    const bottom = pts.map((p) => ({ x: p.x, y: 140 }));
    const d = areaBandPath(pts, bottom);
    expect(d.startsWith("M0,100")).toBe(true);
    expect(d).toContain("L100,140"); // jumps to the bottom edge's last point
    expect(d.endsWith("Z")).toBe(true);
  });
});

describe("stackSeries", () => {
  it("stacks positive series as running sums", () => {
    const bands = stackSeries([
      [1, 2],
      [3, 4],
    ]);
    expect(bands[0]).toEqual([
      [0, 1],
      [0, 2],
    ]);
    expect(bands[1]).toEqual([
      [1, 4],
      [2, 6],
    ]);
  });

  it("treats negative and non-finite values as zero", () => {
    const bands = stackSeries([[-5, NaN, 2]]);
    expect(bands[0]).toEqual([
      [0, 0],
      [0, 0],
      [0, 2],
    ]);
  });
});

describe("pieLayout + arcPath", () => {
  it("slices sum to a full circle, clockwise from 12 o'clock", () => {
    const slices = pieLayout([1, 1, 2]);
    expect(slices[0].startAngle).toBe(0);
    expect(slices[2].endAngle).toBeCloseTo(2 * Math.PI);
    expect(slices[0].fraction).toBeCloseTo(0.25);
    expect(slices[2].fraction).toBeCloseTo(0.5);
  });

  it("zero and negative values become zero-width slices at their index", () => {
    const slices = pieLayout([1, -3, 1]);
    expect(slices.length).toBe(3);
    expect(slices[1].fraction).toBe(0);
    expect(slices[1].startAngle).toBeCloseTo(slices[1].endAngle);
  });

  it("an all-zero pie produces no sweep", () => {
    const slices = pieLayout([0, 0]);
    expect(slices.every((s) => s.fraction === 0)).toBe(true);
  });

  it("arcPath draws a pie slice from the center", () => {
    const d = arcPath(50, 50, 40, 0, 0, Math.PI / 2);
    expect(d.startsWith("M50,50")).toBe(true);
    expect(d).toContain("A40,40");
    expect(d.endsWith("Z")).toBe(true);
    // Quarter sweep from 12 o'clock ends pointing right: (90, 50).
    expect(d).toContain("90,50");
  });

  it("arcPath draws an annular (donut) slice with two arcs", () => {
    const d = arcPath(50, 50, 40, 25, 0, Math.PI);
    expect((d.match(/A/g) ?? []).length).toBe(2);
    expect(d).toContain("A25,25");
  });

  it("a full-circle slice renders as two half arcs", () => {
    const d = arcPath(50, 50, 40, 0, 0, 2 * Math.PI);
    expect((d.match(/M/g) ?? []).length).toBe(2);
  });

  it("a zero-sweep slice renders nothing", () => {
    expect(arcPath(50, 50, 40, 0, 1, 1)).toBe("");
  });
});

describe("order-book depth", () => {
  it("bids accumulate away from the best bid (suffix sums, ascending price)", () => {
    const pts = cumulativeDepth(
      [
        { price: 191, size: 340 },
        { price: 191.2, size: 120 },
        { price: 190.8, size: 260 },
      ],
      "bids",
    );
    expect(pts.map((p) => p.price)).toEqual([190.8, 191, 191.2]);
    expect(pts.map((p) => p.depth)).toEqual([720, 460, 120]);
  });

  it("asks accumulate away from the best ask (prefix sums)", () => {
    const pts = cumulativeDepth(
      [
        { price: 191.9, size: 290 },
        { price: 191.6, size: 150 },
      ],
      "asks",
    );
    expect(pts.map((p) => p.price)).toEqual([191.6, 191.9]);
    expect(pts.map((p) => p.depth)).toEqual([150, 440]);
  });

  it("drops non-finite and non-positive sizes", () => {
    const pts = cumulativeDepth(
      [
        { price: 1, size: 0 },
        { price: 2, size: NaN },
        { price: 3, size: 5 },
      ],
      "asks",
    );
    expect(pts).toEqual([{ price: 3, depth: 5 }]);
  });

  it("stepAreaPath steps between points and closes to the baseline", () => {
    const d = stepAreaPath(
      [
        { x: 0, y: 20 },
        { x: 50, y: 60 },
      ],
      140,
    );
    expect(d).toBe("M0,20 L50,20 L50,60 L50,140 L0,140 Z");
  });

  it("stepAreaPath before-mode steps at the current x first (bid side)", () => {
    const d = stepAreaPath(
      [
        { x: 0, y: 20 },
        { x: 50, y: 60 },
      ],
      140,
      true,
    );
    expect(d).toBe("M0,20 L0,60 L50,60 L50,140 L0,140 Z");
  });
});

describe("formatCompact", () => {
  it("keeps small numbers plain and scales k/M/B", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(1200)).toBe("1.2k");
    expect(formatCompact(20000)).toBe("20k");
    expect(formatCompact(3400000)).toBe("3.4M");
    expect(formatCompact(2500000000)).toBe("2.5B");
    expect(formatCompact(-1500)).toBe("-1.5k");
    expect(formatCompact(0.25)).toBe("0.25");
    expect(formatCompact(NaN)).toBe("");
  });
});

describe("estimateTextWidth", () => {
  it("grows with text length and font size", () => {
    expect(estimateTextWidth("1000", 12)).toBeGreaterThan(estimateTextWidth("10", 12));
    expect(estimateTextWidth("abc", 16)).toBeGreaterThan(estimateTextWidth("abc", 12));
  });

  it("estimates generously enough to cover real digit widths", () => {
    // Digits in the UI font run ~0.55em; the estimate must not be tighter.
    expect(estimateTextWidth("8888", 12)).toBeGreaterThanOrEqual(4 * 0.55 * 12);
  });
});
