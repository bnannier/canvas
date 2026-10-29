import { Defs, Filter, FeGaussianBlur, LinearGradient, Stop } from "react-native-svg";

// The section cards' glows and the selected bar's gradient, as react-native-svg
// definitions so a glow is the same drawing on iOS, Android and the web: a CSS
// `drop-shadow(0 0 Npx c)` or `box-shadow: 0 0 Npx c` is a Gaussian blur of the mark in
// `c` at a standard deviation of half the blur length, drawn under the mark. Ids are
// document-global on the web, so each caller passes ids unique to its instance (useId).

/** A blur filter for a glow `length` px long (the CSS blur length; sigma is half of it). */
export function GlowFilter({ id, length }: { id: string; length: number }) {
  // The region is widened well past the mark so a long blur on a thin mark is not clipped.
  return (
    <Filter id={id} x="-100%" y="-100%" width="300%" height="300%">
      <FeGaussianBlur stdDeviation={length / 2} />
    </Filter>
  );
}

/** The selected bar's fill: the section card's `linear-gradient(180deg, --cyan, --ion)`. */
export function SelectedBarGradient({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  );
}

export { Defs };
