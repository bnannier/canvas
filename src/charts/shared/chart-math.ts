// Pure chart geometry and formatting math for the Chart family. No React, no
// React Native, no theme: every function maps plain numbers to plain numbers
// or SVG path strings, so the whole module is unit-testable without a renderer
// (the bun harness stubs react-native-svg, which makes this split the only way
// to prove the drawing math).
//
// The functions are hand-rolled ports of well-known algorithms (d3's 1-2-5
// tick increments, the Fritsch-Carlson monotone cubic) rather than d3-*
// dependencies: the package deliberately ships with zero runtime dependencies,
// and Metro would bundle all eight transitive d3 modules for the ~300 lines
// used here.

export interface Pt {
  x: number;
  y: number;
}

// --- scales -------------------------------------------------------------------

/**
 * Map `[d0, d1]` linearly onto `[r0, r1]`. A degenerate domain (d0 === d1)
 * maps every value to the range midpoint instead of dividing by zero.
 */
export function linearScale(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

export interface Band {
  /** Left edge of band `i`. */
  position: (i: number) => number;
  /** Center of band `i` (where a line/scatter x for a categorical axis sits). */
  center: (i: number) => number;
  /** Width of one band. */
  bandWidth: number;
  /** Distance from one band's left edge to the next (bandWidth + inner gap). */
  step: number;
}

/**
 * Divide `[r0, r1]` into `count` equal bands with `paddingInner` (0..1 of a
 * step) between bands and `paddingOuter` (same unit) at both edges.
 */
export function bandScale(count: number, r0: number, r1: number, paddingInner = 0.2, paddingOuter = 0.1): Band {
  const n = Math.max(1, count);
  const span = r1 - r0;
  const step = span / Math.max(1, n - paddingInner + paddingOuter * 2);
  const bandWidth = step * (1 - paddingInner);
  const start = r0 + step * paddingOuter;
  return {
    position: (i: number) => start + step * i,
    center: (i: number) => start + step * i + bandWidth / 2,
    bandWidth,
    step,
  };
}

// --- ticks --------------------------------------------------------------------

export interface Ticks {
  /** Ascending tick values, first <= domain min, last >= domain max. */
  ticks: number[];
  /** The niced domain the ticks span. */
  niceMin: number;
  niceMax: number;
}

// The d3 tick-increment idea: steps are 1, 2, or 5 times a power of ten.
function tickStep(span: number, count: number): number {
  const raw = span / Math.max(1, count);
  const power = Math.floor(Math.log10(raw));
  const base = 10 ** power;
  const error = raw / base;
  if (error >= 7.5) return base * 10;
  if (error >= 3.5) return base * 5;
  if (error >= 1.5) return base * 2;
  return base;
}

/**
 * "Nice" ticks covering `[min, max]` with roughly `count` steps of 1/2/5*10^n.
 * The returned domain is expanded outward to the tick grid so the top gridline
 * always sits at or above the data max.
 */
export function niceTicks(min: number, max: number, count = 5): Ticks {
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    // A flat domain still needs a visible scale; grow it around the value.
    const pad = min === 0 ? 1 : Math.abs(min) / 2;
    min -= pad;
    max += pad;
  }
  const step = tickStep(max - min, count);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Round each tick to the step's precision so 0.30000000000000004 never
  // reaches a label.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(Number(v.toFixed(decimals + 1)));
  }
  return { ticks, niceMin: ticks[0], niceMax: ticks[ticks.length - 1] };
}

// --- line & area paths ----------------------------------------------------------

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Straight-segment polyline path ("M x,y L x,y ..."). */
export function linePath(points: Pt[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)},${fmt(p.y)}`).join(" ");
}

const sgn = (x: number) => (x < 0 ? -1 : 1);

// Fritsch-Carlson three-point tangent (port of d3-shape's curveMonotoneX
// slope3): the tangent at the middle point never overshoots the data.
function slope3(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = (y1 - y0) / (h0 || (h1 < 0 ? -0 : 0));
  const s1 = (y2 - y1) / (h1 || (h0 < 0 ? -0 : 0));
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  const m = (sgn(s0) + sgn(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  return Number.isFinite(m) ? m : 0;
}

// One-sided endpoint tangent (d3-shape slope2).
function slope2(x0: number, y0: number, x1: number, y1: number, t: number): number {
  const h = x1 - x0;
  return h ? ((3 * (y1 - y0)) / h - t) / 2 : t;
}

/**
 * Monotone cubic path through `points` (Fritsch-Carlson, x must ascend): the
 * curve is smooth but never overshoots beyond the data values, so a peak in
 * the curve is always a peak in the data.
 */
export function monotonePath(points: Pt[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M${fmt(points[0].x)},${fmt(points[0].y)}`;
  if (n === 2) return linePath(points);

  let d = `M${fmt(points[0].x)},${fmt(points[0].y)}`;
  let t0 = 0;
  for (let i = 1; i < n; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    let t1: number;
    if (i < n - 1) {
      const p2 = points[i + 1];
      t1 = slope3(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
    } else {
      t1 = slope2(p0.x, p0.y, p1.x, p1.y, t0);
    }
    if (i === 1) t0 = slope2(p0.x, p0.y, p1.x, p1.y, t1);
    const dx = (p1.x - p0.x) / 3;
    d += ` C${fmt(p0.x + dx)},${fmt(p0.y + dx * t0)} ${fmt(p1.x - dx)},${fmt(p1.y - dx * t1)} ${fmt(p1.x)},${fmt(p1.y)}`;
    t0 = t1;
  }
  return d;
}

/**
 * A bar rectangle with only its TOP corners rounded (the kit's bar idiom:
 * rounded at the data end, square on the baseline). SVG's `rx` rounds all
 * four corners, so bars draw through this path instead. The radius clamps to
 * what the bar can carry.
 */
export function topRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  if (w <= 0 || h <= 0) return "";
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return (
    `M${fmt(x)},${fmt(y + rr)} A${fmt(rr)},${fmt(rr)} 0 0 1 ${fmt(x + rr)},${fmt(y)} ` +
    `L${fmt(x + w - rr)},${fmt(y)} A${fmt(rr)},${fmt(rr)} 0 0 1 ${fmt(x + w)},${fmt(y + rr)} ` +
    `L${fmt(x + w)},${fmt(y + h)} L${fmt(x)},${fmt(y + h)} Z`
  );
}

/**
 * Closed polygon path ("M x,y L x,y ... Z") through `points` in order. The
 * radar polygons and funnel trapezoids are drawn with this.
 */
export function polygonPath(points: Pt[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)},${fmt(p.y)}`).join(" ") + " Z";
}

/**
 * Close a line down to a horizontal baseline (a single-series area fill).
 * `curved` picks the monotone curve for the top edge.
 */
export function areaPath(points: Pt[], baselineY: number, curved = false): string {
  if (points.length === 0) return "";
  const top = curved ? monotonePath(points) : linePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${fmt(last.x)},${fmt(baselineY)} L${fmt(first.x)},${fmt(baselineY)} Z`;
}

/**
 * Fill between a top and bottom edge (one band of a stacked area). Both edges
 * run left-to-right over the same x positions; the bottom edge is traversed in
 * reverse to close the ring. The Fritsch-Carlson tangents are symmetric under
 * reversal, so curving the reversed bottom matches the bottom's own curve.
 */
export function areaBandPath(top: Pt[], bottom: Pt[], curved = false): string {
  if (top.length === 0 || bottom.length === 0) return "";
  const topPath = curved ? monotonePath(top) : linePath(top);
  const back = [...bottom].reverse();
  const backPath = (curved ? monotonePath(back) : linePath(back)).replace(/^M/, "L");
  return `${topPath} ${backPath} Z`;
}

// --- stacking -------------------------------------------------------------------

/**
 * Running-sum stacking for positive series: returns, per series, the [y0, y1]
 * (bottom, top) value pair at each index. Negative and non-finite values are
 * treated as 0 (mixed-sign stacking is out of the chart family's scope).
 */
export function stackSeries(series: number[][]): Array<Array<[number, number]>> {
  const length = series.reduce((m, s) => Math.max(m, s.length), 0);
  const totals = new Array(length).fill(0);
  return series.map((s) => {
    const bands: Array<[number, number]> = [];
    for (let i = 0; i < length; i++) {
      const raw = s[i];
      const v = Number.isFinite(raw) && raw! > 0 ? raw! : 0;
      bands.push([totals[i], totals[i] + v]);
      totals[i] += v;
    }
    return bands;
  });
}

// --- distributions ----------------------------------------------------------------

/**
 * Uniform histogram bins over `values` with nice edges (the 1/2/5 tick grid,
 * expanded to cover the data). `binCount` overrides the default Sturges' rule
 * (ceil(log2 n) + 1). Non-finite values are dropped; empty input yields empty
 * arrays. `counts[i]` covers `[edges[i], edges[i + 1])`, with the last bin
 * closed so the data max is counted.
 */
export function binValues(values: number[], binCount?: number): { edges: number[]; counts: number[] } {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return { edges: [], counts: [] };
  const count = binCount != null && binCount > 0 ? Math.floor(binCount) : Math.ceil(Math.log2(clean.length)) + 1;
  const { ticks: edges } = niceTicks(Math.min(...clean), Math.max(...clean), count);
  const step = edges[1] - edges[0];
  const counts = new Array<number>(edges.length - 1).fill(0);
  for (const v of clean) {
    const idx = Math.min(counts.length - 1, Math.max(0, Math.floor((v - edges[0]) / step)));
    counts[idx]++;
  }
  return { edges, counts };
}

/**
 * Tukey five-number summary of `values`: quartiles by linear interpolation,
 * whiskers at the most extreme data inside the 1.5 IQR fences, everything
 * beyond listed in `outliers` (ascending). Non-finite values are dropped;
 * empty input yields an all-zero summary.
 */
export function boxStats(values: number[]): { min: number; q1: number; median: number; q3: number; max: number; outliers: number[] } {
  const clean = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (clean.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
  const quantile = (p: number): number => {
    const idx = (clean.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return clean[lo] + (clean[hi] - clean[lo]) * (idx - lo);
  };
  const q1 = quantile(0.25);
  const median = quantile(0.5);
  const q3 = quantile(0.75);
  const iqr = q3 - q1;
  const loFence = q1 - 1.5 * iqr;
  const hiFence = q3 + 1.5 * iqr;
  // A datum between the quartile index positions always survives the fences,
  // so the whisker ends are never undefined.
  const inliers = clean.filter((v) => v >= loFence && v <= hiFence);
  const outliers = clean.filter((v) => v < loFence || v > hiFence);
  return { min: inliers[0], q1, median, q3, max: inliers[inliers.length - 1], outliers };
}

// --- waterfall --------------------------------------------------------------------

export interface WaterfallBar {
  /** The running total where this bar starts (its value edge nearer zero history). */
  start: number;
  /** The running total where this bar ends. */
  end: number;
  /** Rise (positive step), fall (negative step), or total (a snapshot from 0). */
  kind: "rise" | "fall" | "total";
}

/**
 * Bar spans for a running-total bridge. Each step floats from the running
 * total to the total plus its signed `value`; a `total` step instead draws an
 * absolute bar from 0 to the running total (start, subtotal, end markers) and
 * leaves the total unchanged. Non-finite values are treated as 0. `min`/`max`
 * span every bar edge and 0, ready for a y extent.
 */
export function waterfallLayout(steps: Array<{ value: number; total?: boolean }>): { bars: WaterfallBar[]; min: number; max: number } {
  let run = 0;
  let min = 0;
  let max = 0;
  const bars = steps.map((step): WaterfallBar => {
    if (step.total) {
      min = Math.min(min, run);
      max = Math.max(max, run);
      return { start: 0, end: run, kind: "total" };
    }
    const v = Number.isFinite(step.value) ? step.value : 0;
    const start = run;
    run += v;
    min = Math.min(min, run);
    max = Math.max(max, run);
    return { start, end: run, kind: v < 0 ? "fall" : "rise" };
  });
  return { bars, min, max };
}

// --- pie ------------------------------------------------------------------------

export interface Slice {
  /** Start/end angles in radians; 0 points up (12 o'clock), increasing clockwise. */
  startAngle: number;
  endAngle: number;
  /** This slice's share of the total, 0..1. */
  fraction: number;
}

/**
 * Angles for a pie: slices start at 12 o'clock and run clockwise in input
 * order. Negative and non-finite values become zero-width slices (kept in the
 * output so slice index still matches input index).
 */
export function pieLayout(values: number[]): Slice[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  let angle = 0;
  return clean.map((v) => {
    const fraction = total > 0 ? v / total : 0;
    const startAngle = angle;
    angle += fraction * 2 * Math.PI;
    return { startAngle, endAngle: angle, fraction };
  });
}

/**
 * The point at radius `r` and `angle` around `(cx, cy)`: 0 rad points up
 * (12 o'clock), increasing clockwise, in standard screen coordinates (y grows
 * downward). The polar workhorse for arcs, radial bars, and radar spokes.
 */
export function polarPoint(cx: number, cy: number, r: number, angle: number): Pt {
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

/**
 * SVG path for an annular sector (donut slice; `rInner` 0 gives a pie slice).
 * A full-circle slice (fraction ~1) is drawn as two half arcs, since a single
 * SVG arc cannot span 360 degrees.
 */
export function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0) return "";
  const full = sweep >= 2 * Math.PI - 1e-6;
  if (full) {
    // Two stacked half-rings (or half-discs) forming the complete circle.
    const mid = startAngle + Math.PI;
    return arcPath(cx, cy, rOuter, rInner, startAngle, mid) + " " + arcPath(cx, cy, rOuter, rInner, mid, startAngle + 2 * Math.PI);
  }
  const large = sweep > Math.PI ? 1 : 0;
  const o0 = polarPoint(cx, cy, rOuter, startAngle);
  const o1 = polarPoint(cx, cy, rOuter, endAngle);
  if (rInner <= 0) {
    return `M${fmt(cx)},${fmt(cy)} L${fmt(o0.x)},${fmt(o0.y)} A${fmt(rOuter)},${fmt(rOuter)} 0 ${large} 1 ${fmt(o1.x)},${fmt(o1.y)} Z`;
  }
  const i0 = polarPoint(cx, cy, rInner, startAngle);
  const i1 = polarPoint(cx, cy, rInner, endAngle);
  return (
    `M${fmt(o0.x)},${fmt(o0.y)} A${fmt(rOuter)},${fmt(rOuter)} 0 ${large} 1 ${fmt(o1.x)},${fmt(o1.y)} ` +
    `L${fmt(i1.x)},${fmt(i1.y)} A${fmt(rInner)},${fmt(rInner)} 0 ${large} 0 ${fmt(i0.x)},${fmt(i0.y)} Z`
  );
}

// --- layout charts ----------------------------------------------------------------

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Squarified treemap (Bruls, Huizing, van Wijk): tile the `(x, y, w, h)` box
 * with one rectangle per value, areas proportional to the values, aspect
 * ratios kept near 1. `rects[i]` always belongs to `values[i]` (the layout
 * sorts internally but places results back by input index). Non-positive and
 * non-finite values get a zero-area rect at the box origin.
 */
export function squarify(values: number[], x: number, y: number, w: number, h: number): Rect[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const out: Rect[] = clean.map(() => ({ x, y, w: 0, h: 0 }));
  const total = clean.reduce((a, b) => a + b, 0);
  if (total <= 0 || w <= 0 || h <= 0) return out;

  // Work in area units; descending order gives the algorithm its guarantee.
  const scale = (w * h) / total;
  const items = clean
    .map((v, i) => ({ a: v * scale, i }))
    .filter((it) => it.a > 0)
    .sort((p, q) => q.a - p.a);

  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;

  // Worst aspect ratio in a row of summed area `s` laid along `side`.
  const worst = (row: Array<{ a: number }>, s: number, side: number): number => {
    let maxA = -Infinity;
    let minA = Infinity;
    for (const r of row) {
      if (r.a > maxA) maxA = r.a;
      if (r.a < minA) minA = r.a;
    }
    const s2 = s * s;
    const side2 = side * side;
    return Math.max((side2 * maxA) / s2, s2 / (side2 * minA));
  };

  // Lay `row` along the shorter side of the remaining box, then shrink it.
  const placeRow = (row: Array<{ a: number; i: number }>, s: number): void => {
    if (cw < ch) {
      const stripH = s / cw;
      let px = cx;
      for (const it of row) {
        const iw = it.a / stripH;
        out[it.i] = { x: px, y: cy, w: iw, h: stripH };
        px += iw;
      }
      cy += stripH;
      ch -= stripH;
    } else {
      const stripW = s / ch;
      let py = cy;
      for (const it of row) {
        const ih = it.a / stripW;
        out[it.i] = { x: cx, y: py, w: stripW, h: ih };
        py += ih;
      }
      cx += stripW;
      cw -= stripW;
    }
  };

  let row: Array<{ a: number; i: number }> = [];
  let rowSum = 0;
  for (const it of items) {
    const side = Math.min(cw, ch);
    if (row.length === 0 || worst(row, rowSum, side) >= worst([...row, it], rowSum + it.a, side)) {
      row.push(it);
      rowSum += it.a;
    } else {
      placeRow(row, rowSum);
      row = [it];
      rowSum = it.a;
    }
  }
  if (row.length > 0) placeRow(row, rowSum);
  return out;
}

/**
 * Centered trapezoid outlines for a funnel in a `w` x `h` box: one stage per
 * value, top width proportional to the stage's value, tapering to the NEXT
 * stage's width; the last stage is rectangular. Each stage is 4 points
 * clockwise from the top-left, ready for `polygonPath`. `gap` is the vertical
 * space between stages. Non-positive values yield zero-width stages.
 */
export function funnelLayout(values: number[], w: number, h: number, gap = 2): Pt[][] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const n = clean.length;
  if (n === 0 || w <= 0 || h <= 0) return [];
  const peak = Math.max(...clean);
  const half = (v: number): number => (peak > 0 ? (v / peak) * w : 0) / 2;
  const stageH = Math.max(0, (h - gap * (n - 1)) / n);
  const mid = w / 2;
  return clean.map((v, i) => {
    const top = half(v);
    const bottom = half(i < n - 1 ? clean[i + 1] : v);
    const y0 = i * (stageH + gap);
    const y1 = y0 + stageH;
    return [
      { x: mid - top, y: y0 },
      { x: mid + top, y: y0 },
      { x: mid + bottom, y: y1 },
      { x: mid - bottom, y: y1 },
    ];
  });
}

// --- order-book depth ---------------------------------------------------------------

export interface DepthLevel {
  price: number;
  size: number;
}

export interface DepthPoint {
  price: number;
  /** Cumulative size at this price (away from the spread). */
  depth: number;
}

/**
 * Cumulative order-book depth per level, sorted by ascending price. Bids
 * accumulate away from the best bid (suffix sums: the lowest price carries
 * the total), asks away from the best ask (prefix sums). Non-finite and
 * non-positive sizes are dropped.
 */
export function cumulativeDepth(levels: DepthLevel[], side: "bids" | "asks"): DepthPoint[] {
  const clean = levels
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.size) && l.size > 0)
    .sort((a, b) => a.price - b.price);
  if (clean.length === 0) return [];
  const depths = new Array<number>(clean.length);
  if (side === "asks") {
    let run = 0;
    for (let i = 0; i < clean.length; i++) depths[i] = run += clean[i].size;
  } else {
    let run = 0;
    for (let i = clean.length - 1; i >= 0; i--) depths[i] = run += clean[i].size;
  }
  return clean.map((l, i) => ({ price: l.price, depth: depths[i] }));
}

/**
 * Closed step-area path through `points` (ascending x), then down to the
 * baseline and back. Step-after (default) holds each y until the NEXT x (an
 * ask book: depth rises AT each level price); `before` steps at the CURRENT
 * x first (a bid book: depth drops AT each level price moving right).
 */
export function stepAreaPath(points: Pt[], baselineY: number, before = false): string {
  if (points.length === 0) return "";
  let d = `M${fmt(points[0].x)},${fmt(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    d += before
      ? ` L${fmt(points[i - 1].x)},${fmt(points[i].y)} L${fmt(points[i].x)},${fmt(points[i].y)}`
      : ` L${fmt(points[i].x)},${fmt(points[i - 1].y)} L${fmt(points[i].x)},${fmt(points[i].y)}`;
  }
  const last = points[points.length - 1];
  const first = points[0];
  return `${d} L${fmt(last.x)},${fmt(baselineY)} L${fmt(first.x)},${fmt(baselineY)} Z`;
}

// --- formatting -------------------------------------------------------------------

/**
 * Compact tick/label formatting: 950 -> "950", 1200 -> "1.2k", 3400000 ->
 * "3.4M", 2500000000 -> "2.5B". One decimal at most, trailing ".0" trimmed.
 */
export function formatCompact(v: number): string {
  if (!Number.isFinite(v)) return "";
  const abs = Math.abs(v);
  const scaled = (n: number, suffix: string) => {
    const s = (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");
    return `${v < 0 ? "-" : ""}${s}${suffix}`;
  };
  if (abs >= 1e9) return scaled(abs / 1e9, "B");
  if (abs >= 1e6) return scaled(abs / 1e6, "M");
  if (abs >= 1e3) return scaled(abs / 1e3, "k");
  // Small magnitudes keep at most two decimals, trimmed.
  const s = (Math.round(v * 100) / 100).toString();
  return s;
}

// --- accessible names --------------------------------------------------------------

// Past this many categories, a series' accessible name summarizes its shape
// rather than listing every value: folding 30+ numbers into one aria-label is
// both unwieldy to author and useless to a screen reader, so dense charts get
// "first, last, low, high, N points" instead. Below it, every value is named.
export const DENSE_SERIES = 24;

/**
 * The accessible name for one labeled series across `labels`, formatted with
 * `fmt`. Dense series (more than DENSE_SERIES points) are summarized by their
 * endpoints and range; sparse series list every "<label> <value>" pair.
 */
export function seriesAccessibleName(label: string, values: number[], labels: string[], fmt: (v: number) => string): string {
  const at = (i: number) => (Number.isFinite(values[i]) ? values[i] : 0);
  if (labels.length > DENSE_SERIES) {
    const nums = labels.map((_, i) => at(i));
    const lo = Math.min(...nums);
    const hi = Math.max(...nums);
    return `${label}: ${labels.length} points from ${fmt(at(0))} to ${fmt(at(labels.length - 1))}, low ${fmt(lo)}, high ${fmt(hi)}`;
  }
  return `${label}: ${labels.map((l, i) => `${l} ${fmt(at(i))}`).join(", ")}`;
}

// --- text measurement --------------------------------------------------------------

// Per-character width factors (em units) for the UI font, deliberately a touch
// generous so estimated labels under-run their gutter instead of clipping.
// This is the workaround for React Native SVG/Text having no synchronous
// measurement API (no getBBox / measureText off the DOM).
function charFactor(ch: string): number {
  if (ch >= "0" && ch <= "9") return 0.66;
  if (ch === "." || ch === ",") return 0.32;
  if (ch === "-" || ch === " ") return 0.38;
  if (ch === "%") return 1.0;
  if (ch >= "A" && ch <= "Z") return 0.78;
  return 0.6; // lowercase and everything else
}

/** Estimated rendered width in px of `text` at `fontSize`. */
export function estimateTextWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) em += charFactor(ch);
  return em * fontSize;
}
