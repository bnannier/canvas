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

const MARK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${MARK_PATHS.map(
    (d) => `<path d="${d}" fill="#000"/>`,
  ).join("")}</svg>`,
)}")`;

const MARK_GRADIENT =
  "conic-gradient(from 0deg," +
  "#46e082 29deg," + // green (top-right)
  "#b24dff 144deg," + // purple (lower-right, after the gap)
  "#ff2d6e 187deg," + // pink (bottom)
  "#ff6a4d 229deg," + // coral (lower-left)
  "#ffb43d 275deg," + // amber (left)
  "#27cdf2 330deg)"; // blue (upper-left), wraps back to green across the top

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
