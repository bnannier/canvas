import Svg, { G, Path } from "react-native-svg";

// The Canvas mark: a rainbow "C" — six hue wedges around an open counter with a gap
// on the right. The web version masks ONE conic gradient to these six wedge paths; RN
// has no conic gradient or mask, so we fill each exact wedge path with its solid hue
// (the design's original per-segment colors, before the conic smoothed the blend).
// Paths + the optical-centering translate(1.56) are copied verbatim from the web mark.
const MARK_PATHS = [
  "M31.293 28.557 L41.385 34.863 A20.5 20.5 0 0 1 28.959 43.891 L26.081 32.345 A8.6 8.6 0 0 0 31.293 28.557 Z",
  "M26.081 32.345 L28.959 43.891 A20.5 20.5 0 0 1 14.376 42.1 L19.963 31.593 A8.6 8.6 0 0 0 26.081 32.345 Z",
  "M19.963 31.593 L14.376 42.1 A20.5 20.5 0 0 1 4.736 31.011 L15.919 26.941 A8.6 8.6 0 0 0 19.963 31.593 Z",
  "M15.919 26.941 L4.736 31.011 A20.5 20.5 0 0 1 6.246 13.75 L16.552 19.7 A8.6 8.6 0 0 0 15.919 26.941 Z",
  "M16.552 19.7 L6.246 13.75 A20.5 20.5 0 0 1 24 3.5 L24 15.4 A8.6 8.6 0 0 0 16.552 19.7 Z",
  "M24 15.4 L24 3.5 A20.5 20.5 0 0 1 41.385 13.137 L31.293 19.443 A8.6 8.6 0 0 0 24 15.4 Z",
];

// Hue per wedge, clockwise from just below the gap (lower-right): purple, pink, coral,
// amber, blue, green — matching where each sat in the segmented design.
const COLORS = ["#b24dff", "#ff2d6e", "#ff6a4d", "#ffb43d", "#27cdf2", "#46e082"];

export function CanvasMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G translateX={1.56}>
        {MARK_PATHS.map((d, i) => (
          <Path key={i} d={d} fill={COLORS[i]} />
        ))}
      </G>
    </Svg>
  );
}
