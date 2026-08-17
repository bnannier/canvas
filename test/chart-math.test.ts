import { describe, it, expect } from "bun:test";
import {
  arcPath,
  binValues,
  boxStats,
  cumulativeDepth,
  stepAreaPath,
  areaBandPath,
  areaPath,
  bandScale,
  estimateTextWidth,
  formatCompact,
  funnelLayout,
  seriesAccessibleName,
  linePath,
  linearScale,
  monotonePath,
  niceTicks,
  pieLayout,
  polarPoint,
  polygonPath,
  squarify,
  stackSeries,
  waterfallLayout,
} from "../src/charts/shared/chart-math.ts";

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

describe("seriesAccessibleName", () => {
  const fmt = (v: number) => String(v);

  it("lists every value for a sparse series", () => {
    const name = seriesAccessibleName("Web", [12, 19, 15], ["Jan", "Feb", "Mar"], fmt);
    expect(name).toBe("Web: Jan 12, Feb 19, Mar 15");
  });

  it("summarizes a dense series by endpoints and range", () => {
    const values = Array.from({ length: 30 }, (_, i) => 100 + i);
    const labels = Array.from({ length: 30 }, (_, i) => `d${i}`);
    const name = seriesAccessibleName("Price", values, labels, fmt);
    expect(name).toBe("Price: 30 points from 100 to 129, low 100, high 129");
    expect(name).not.toContain("d15"); // no per-point listing
  });

  it("treats non-finite values as zero in the summary", () => {
    const values = [NaN, ...Array.from({ length: 30 }, () => 5)];
    const labels = Array.from({ length: 31 }, (_, i) => `d${i}`);
    const name = seriesAccessibleName("S", values, labels, fmt);
    expect(name).toContain("from 0 to 5");
    expect(name).toContain("low 0");
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

describe("polarPoint", () => {
  it("puts 0 rad at 12 o'clock and sweeps clockwise", () => {
    const top = polarPoint(50, 50, 40, 0);
    expect(top.x).toBeCloseTo(50);
    expect(top.y).toBeCloseTo(10);
    const right = polarPoint(50, 50, 40, Math.PI / 2);
    expect(right.x).toBeCloseTo(90);
    expect(right.y).toBeCloseTo(50);
    const bottom = polarPoint(50, 50, 40, Math.PI);
    expect(bottom.x).toBeCloseTo(50);
    expect(bottom.y).toBeCloseTo(90);
  });

  it("round-trips a full turn back to the start", () => {
    const a = polarPoint(10, 20, 5, 1.2);
    const b = polarPoint(10, 20, 5, 1.2 + 2 * Math.PI);
    expect(b.x).toBeCloseTo(a.x);
    expect(b.y).toBeCloseTo(a.y);
  });
});

describe("polygonPath", () => {
  it("closes the ring through every point", () => {
    const d = polygonPath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 8 },
    ]);
    expect(d).toBe("M0,0 L10,0 L5,8 Z");
  });

  it("renders nothing for no points", () => {
    expect(polygonPath([])).toBe("");
  });
});

describe("binValues", () => {
  it("bins samples into uniform nice-edged buckets covering the data", () => {
    const { edges, counts } = binValues([1, 2, 2, 3, 8, 9], 4);
    expect(edges[0]).toBeLessThanOrEqual(1);
    expect(edges[edges.length - 1]).toBeGreaterThanOrEqual(9);
    expect(counts.length).toBe(edges.length - 1);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(6);
    // Uniform edges.
    const step = edges[1] - edges[0];
    for (let i = 2; i < edges.length; i++) expect(edges[i] - edges[i - 1]).toBeCloseTo(step);
  });

  it("counts the data max in the last bin (closed top edge)", () => {
    const { edges, counts } = binValues([0, 10], 5);
    expect(edges[edges.length - 1]).toBeGreaterThanOrEqual(10);
    expect(counts[counts.length - 1]).toBeGreaterThanOrEqual(1);
  });

  it("defaults the bin count to Sturges' rule", () => {
    const { counts } = binValues(Array.from({ length: 64 }, (_, i) => i));
    // ceil(log2 64) + 1 = 7 requested; the nice grid lands near that.
    expect(counts.length).toBeGreaterThanOrEqual(5);
    expect(counts.length).toBeLessThanOrEqual(10);
  });

  it("survives flat and dirty input", () => {
    const flat = binValues([5, 5, 5]);
    expect(flat.counts.reduce((a, b) => a + b, 0)).toBe(3);
    expect(binValues([NaN, Infinity])).toEqual({ edges: [], counts: [] });
    expect(binValues([])).toEqual({ edges: [], counts: [] });
  });
});

describe("boxStats", () => {
  it("computes the five-number summary with interpolated quartiles", () => {
    // Hand-computed: sorted [1,2,3,4,5]; q1=2, median=3, q3=4, no outliers.
    const s = boxStats([3, 1, 5, 2, 4]);
    expect(s.q1).toBe(2);
    expect(s.median).toBe(3);
    expect(s.q3).toBe(4);
    expect(s.min).toBe(1);
    expect(s.max).toBe(5);
    expect(s.outliers).toEqual([]);
  });

  it("pushes points beyond the 1.5 IQR fences into outliers and pulls whiskers in", () => {
    // Sorted [0,0,0,100]: q1=0, q3=25, iqr=25, high fence 62.5.
    const s = boxStats([0, 100, 0, 0]);
    expect(s.outliers).toEqual([100]);
    expect(s.max).toBe(0); // whisker stops at the last inlier
  });

  it("handles single values and empty input", () => {
    const one = boxStats([7]);
    expect(one).toEqual({ min: 7, q1: 7, median: 7, q3: 7, max: 7, outliers: [] });
    expect(boxStats([NaN])).toEqual({ min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] });
  });
});

describe("waterfallLayout", () => {
  it("floats each step from the running total and snapshots totals from 0", () => {
    const { bars, min, max } = waterfallLayout([
      { value: 100 },
      { value: 30 },
      { value: -12 },
      { value: 0, total: true },
    ]);
    expect(bars[0]).toEqual({ start: 0, end: 100, kind: "rise" });
    expect(bars[1]).toEqual({ start: 100, end: 130, kind: "rise" });
    expect(bars[2]).toEqual({ start: 130, end: 118, kind: "fall" });
    expect(bars[3]).toEqual({ start: 0, end: 118, kind: "total" });
    expect(min).toBe(0);
    expect(max).toBe(130);
  });

  it("tracks a negative running total in the extent", () => {
    const { bars, min } = waterfallLayout([{ value: -40 }, { value: 15 }]);
    expect(bars[0].kind).toBe("fall");
    expect(min).toBe(-40);
  });

  it("treats non-finite steps as zero", () => {
    const { bars } = waterfallLayout([{ value: NaN }]);
    expect(bars[0]).toEqual({ start: 0, end: 0, kind: "rise" });
  });
});

describe("squarify", () => {
  const area = (r: { w: number; h: number }) => r.w * r.h;

  it("lays out the classic Bruls fixture with near-square tiles", () => {
    // The paper's example: [6,6,4,3,2,2,1] in a 6x4 box (total 24 = box area).
    const rects = squarify([6, 6, 4, 3, 2, 2, 1], 0, 0, 6, 4);
    // Area conservation, per rect and in total.
    rects.forEach((r, i) => expect(area(r)).toBeCloseTo([6, 6, 4, 3, 2, 2, 1][i]));
    expect(rects.reduce((a, r) => a + area(r), 0)).toBeCloseTo(24);
    // The two 6s form the first column strip: width 3, stacked heights 2 + 2.
    expect(rects[0].w).toBeCloseTo(3);
    expect(rects[0].h).toBeCloseTo(2);
    expect(rects[1].w).toBeCloseTo(3);
    // Every aspect ratio stays comfortably below the slice-and-dice worst case.
    for (const r of rects) {
      const aspect = Math.max(r.w / r.h, r.h / r.w);
      expect(aspect).toBeLessThanOrEqual(3.01);
    }
  });

  it("keeps rect i attached to value i despite internal sorting", () => {
    const values = [1, 6, 2];
    const rects = squarify(values, 0, 0, 9, 1);
    rects.forEach((r, i) => expect(area(r)).toBeCloseTo(values[i]));
  });

  it("tiles stay inside the box", () => {
    const rects = squarify([5, 3, 2, 1, 1], 10, 20, 100, 60);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(10 - 1e-6);
      expect(r.y).toBeGreaterThanOrEqual(20 - 1e-6);
      expect(r.x + r.w).toBeLessThanOrEqual(110 + 1e-6);
      expect(r.y + r.h).toBeLessThanOrEqual(80 + 1e-6);
    }
  });

  it("zero, negative, and non-finite values get zero-area rects at their index", () => {
    const rects = squarify([4, 0, -2, NaN], 0, 0, 10, 10);
    expect(area(rects[0])).toBeCloseTo(100);
    for (const i of [1, 2, 3]) expect(area(rects[i])).toBe(0);
    expect(rects.length).toBe(4);
  });
});

describe("funnelLayout", () => {
  it("tapers each stage to the next stage's width, centered", () => {
    const stages = funnelLayout([100, 50, 25], 200, 130, 2);
    expect(stages.length).toBe(3);
    // Stage heights: (130 - 2*2) / 3 = 42.
    expect(stages[0][3].y - stages[0][0].y).toBeCloseTo(42);
    // First stage: full width on top, tapering to half.
    expect(stages[0][1].x - stages[0][0].x).toBeCloseTo(200);
    expect(stages[0][2].x - stages[0][3].x).toBeCloseTo(100);
    // Second stage's top matches the first stage's bottom width.
    expect(stages[1][1].x - stages[1][0].x).toBeCloseTo(100);
    // Last stage is rectangular.
    expect(stages[2][1].x - stages[2][0].x).toBeCloseTo(stages[2][2].x - stages[2][3].x);
    // Symmetry about the middle.
    for (const st of stages) expect((st[0].x + st[1].x) / 2).toBeCloseTo(100);
  });

  it("handles empty and all-zero input", () => {
    expect(funnelLayout([], 100, 100)).toEqual([]);
    const zero = funnelLayout([0, 0], 100, 100);
    expect(zero.length).toBe(2);
    for (const st of zero) expect(st[1].x - st[0].x).toBe(0);
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
