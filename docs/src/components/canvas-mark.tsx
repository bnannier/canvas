interface CanvasMarkProps {
  size?: number;
}

// The Canvas mark: a rainbow "C", a ring of six hues around an open counter with
// a wedge gap on the right. Rather than six separate per-segment gradients, the
// color is ONE conic gradient that flows continuously around the curve, blending
// the same six brand hues; it is masked to the exact C silhouette (the six wedge
// paths) so the shape is unchanged and the open counter still sits cleanly on any
// background. The stop angles match where each hue sat in the segmented version,
// measured clockwise from the top: green ~29°, then the gap, purple ~144°, pink
// ~187°, coral ~229°, amber ~275°, blue ~330°, wrapping blue→green across the top.
const MARK_PATHS = [
  "M31.293 28.557 L41.385 34.863 A20.5 20.5 0 0 1 28.959 43.891 L26.081 32.345 A8.6 8.6 0 0 0 31.293 28.557 Z",
  "M26.081 32.345 L28.959 43.891 A20.5 20.5 0 0 1 14.376 42.1 L19.963 31.593 A8.6 8.6 0 0 0 26.081 32.345 Z",
  "M19.963 31.593 L14.376 42.1 A20.5 20.5 0 0 1 4.736 31.011 L15.919 26.941 A8.6 8.6 0 0 0 19.963 31.593 Z",
  "M15.919 26.941 L4.736 31.011 A20.5 20.5 0 0 1 6.246 13.75 L16.552 19.7 A8.6 8.6 0 0 0 15.919 26.941 Z",
  "M16.552 19.7 L6.246 13.75 A20.5 20.5 0 0 1 24 3.5 L24 15.4 A8.6 8.6 0 0 0 16.552 19.7 Z",
  "M24 15.4 L24 3.5 A20.5 20.5 0 0 1 41.385 13.137 L31.293 19.443 A8.6 8.6 0 0 0 24 15.4 Z",
];

// The wedge gap eats the rightmost arc, so the ink spans x≈3.5→41.4 (not 3.5→44.5)
// and its bounding box sits ~1.56 units left of the SVG center. Nudge the shape
// right by that much so the visible mark is OPTICALLY centered (the conic center
// is moved to match, below). In viewBox units, so it scales at every size.
const MARK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g transform="translate(1.56 0)">${MARK_PATHS.map(
    (d) => `<path d="${d}" fill="#000"/>`,
  ).join("")}</g></svg>`,
)}")`;

// One conic sweep around the C. The gradient's wrap seam (last stop → first
// stop) is the only hard edge a conic can have, so we start `from 90deg` to put
// that seam at 3 o'clock, inside the masked wedge gap. Every VISIBLE transition
// is then a smooth blend, including blue→green across the top. Stop angles are
// gap-relative (screen angle − 90°) but place each hue exactly where it sat
// before: purple 144°, pink 187°, coral 229°, amber 275°, blue 330°, green 29°.
const MARK_GRADIENT =
  // Centered on the nudged ring center (24 + 1.56 = 25.56 → 53.25%) so the sweep
  // and its hidden seam stay aligned with the shape after the optical shift.
  "conic-gradient(from 90deg at 53.25% 50%," +
  "#b24dff 54deg," + // purple (just below the gap)
  "#ff2d6e 97deg," + // pink (bottom)
  "#ff6a4d 139deg," + // coral (lower-left)
  "#ffb43d 185deg," + // amber (left)
  "#27cdf2 240deg," + // blue (upper-left)
  "#46e082 299deg)"; // green (top-right); seam back to purple sits in the gap

export function CanvasMark({ size = 22 }: CanvasMarkProps) {
  return (
    <span
      role="img"
      aria-label="Canvas"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: MARK_GRADIENT,
        WebkitMaskImage: MARK_MASK,
        maskImage: MARK_MASK,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
