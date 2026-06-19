import Svg, { G, Path, ClipPath, Defs } from "react-native-svg";

// The Canvas mark: a rainbow "C", six hues blended as ONE continuous conic sweep around
// an open counter with a wedge gap on the right. The Vite mark fills the C silhouette with
// a real CSS conic-gradient; react-native-svg has no conic gradient, so we approximate it
// with many thin pie sectors (interpolated colors) clipped to the exact C silhouette, which
// reads as a smooth conic on every platform. Geometry + stops are copied verbatim from the
// web mark from the previous web docs: conic `from 90deg at 53.25% 50%`.
const MARK_PATHS = [
  "M31.293 28.557 L41.385 34.863 A20.5 20.5 0 0 1 28.959 43.891 L26.081 32.345 A8.6 8.6 0 0 0 31.293 28.557 Z",
  "M26.081 32.345 L28.959 43.891 A20.5 20.5 0 0 1 14.376 42.1 L19.963 31.593 A8.6 8.6 0 0 0 26.081 32.345 Z",
  "M19.963 31.593 L14.376 42.1 A20.5 20.5 0 0 1 4.736 31.011 L15.919 26.941 A8.6 8.6 0 0 0 19.963 31.593 Z",
  "M15.919 26.941 L4.736 31.011 A20.5 20.5 0 0 1 6.246 13.75 L16.552 19.7 A8.6 8.6 0 0 0 15.919 26.941 Z",
  "M16.552 19.7 L6.246 13.75 A20.5 20.5 0 0 1 24 3.5 L24 15.4 A8.6 8.6 0 0 0 16.552 19.7 Z",
  "M24 15.4 L24 3.5 A20.5 20.5 0 0 1 41.385 13.137 L31.293 19.443 A8.6 8.6 0 0 0 24 15.4 Z",
];

// The conic stops (CSS gradient positions, clockwise from the `from 90deg` start, which
// puts the wrap seam in the gap at 3 o'clock so every visible transition is smooth).
const STOPS: [number, string][] = [
  [54, "#b24dff"], // purple (just below the gap)
  [97, "#ff2d6e"], // pink (bottom)
  [139, "#ff6a4d"], // coral (lower-left)
  [185, "#ffb43d"], // amber (left)
  [240, "#27cdf2"], // blue (upper-left)
  [299, "#46e082"], // green (top-right)
];

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number): string {
  const x = rgb(a), y = rgb(b);
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * t)},${Math.round(x[1] + (y[1] - x[1]) * t)},${Math.round(x[2] + (y[2] - x[2]) * t)})`;
}
// The conic color at a CSS gradient position (0-360); flat before the first / after the
// last stop, matching how the browser renders the seam inside the gap.
function conic(pos: number): string {
  if (pos <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (pos >= p0 && pos <= p1) return mix(c0, c1, (pos - p0) / (p1 - p0));
  }
  return STOPS[STOPS.length - 1][1];
}

// The conic center = the ring center (24,24). Sectors fan out past the 20.5 outer radius;
// the clip trims them to the C.
const CX = 24, CY = 24, R = 22, N = 144, STEP = 360 / N;
const ptScreen = (a: number): [number, number] => {
  const r = (a * Math.PI) / 180; // screen angle, clockwise from top
  return [CX + R * Math.sin(r), CY - R * Math.cos(r)];
};
const SECTORS = Array.from({ length: N }, (_, i) => {
  const a0 = i * STEP, a1 = (i + 1) * STEP, am = a0 + STEP / 2;
  const [x0, y0] = ptScreen(a0);
  const [x1, y1] = ptScreen(a1);
  const pos = (((am - 90) % 360) + 360) % 360; // CSS conic position for `from 90deg`
  return { d: `M${CX} ${CY} L${x0.toFixed(3)} ${y0.toFixed(3)} A${R} ${R} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)} Z`, color: conic(pos) };
});

export function CanvasMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="canvas-mark">
          {MARK_PATHS.map((d, i) => <Path key={i} d={d} />)}
        </ClipPath>
      </Defs>
      <G transform="translate(1.56, 0)" clipPath="url(#canvas-mark)">
        {SECTORS.map((s, i) => <Path key={i} d={s.d} fill={s.color} />)}
      </G>
    </Svg>
  );
}
