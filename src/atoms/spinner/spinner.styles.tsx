import { ActivityIndicator, Animated } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { type ColorTokens } from "../../style/index.js";
import { type SpinnerSkin } from "./spinner.shared.js";

// Co-located Spinner skins, one per platform. The BRAND survives on every
// platform (the arc/spoke color is a semantic token, never a platform default),
// and only the native SHAPE of the loader changes per OS:
//   iOS (UIActivityIndicatorView): a ring of 12 short rounded SPOKES arranged
//     radially around the center, each with a graduated opacity (a fading
//     "clock" of lines), the whole ring rotating continuously. Color = the tone
//     token (default the muted/foreground arc color).
//   Android (M3 CircularProgressIndicator, indeterminate): a SINGLE ARC, a ~270deg
//     stroke of a ring with a rounded cap, in the brand color, sweeping
//     continuously around the circle.
//   Web: the established Canvas look, a React Native ActivityIndicator driven by
//     the same tone/size props, lifted verbatim from the original component.

export type Tone = "primary" | "muted" | "foreground";

// Arc/spoke color token per tone: reads from the active brand tokens (via
// useTheme) so it follows light/dark and the glass surface.
export const TONE_TOKEN: Record<Tone, keyof ColorTokens> = {
  primary: "primary",
  muted: "muted-foreground",
  foreground: "foreground",
};

// react-native-svg's Circle/Line aren't Animated components; wrapping the SVG in
// the shell's Animated.View and spinning that is enough, but the rotation has to
// live on an Animated.View. The skins below return a static SVG; the shell's
// Animated.View carries the spin. To make the *shape itself* rotate (not just the
// bounding box), each spinning skin wraps its SVG in an Animated.View whose
// transform interpolates the shared 0..1 value to 0..360deg.

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// iOS: 12 spokes laid out every 30deg around the center, each a short rounded
// line from an inner radius to the rim. Opacity steps down around the ring so the
// leading spoke is solid and the trailing ones fade, the classic iOS look. The
// whole SVG rotates via the shared spin value.
const SPOKE_COUNT = 12;

export const iosSkin: SpinnerSkin = {
  render: ({ size, color, rotate }) => {
    const c = size / 2;
    const outer = size / 2;
    const inner = size * 0.28;
    const strokeWidth = Math.max(1, size * 0.08);
    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    const spokes = Array.from({ length: SPOKE_COUNT }, (_, i) => {
      const angle = (i / SPOKE_COUNT) * 2 * Math.PI - Math.PI / 2;
      const x1 = c + inner * Math.cos(angle);
      const y1 = c + inner * Math.sin(angle);
      const x2 = c + outer * Math.cos(angle);
      const y2 = c + outer * Math.sin(angle);
      // Leading spoke solid, fading around the ring (min ~0.2).
      const opacity = 0.2 + (0.8 * i) / (SPOKE_COUNT - 1);
      return (
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    });
    return (
      <AnimatedSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: spin }] }}>
        {spokes}
      </AnimatedSvg>
    );
  },
};

// Android (M3): one ~270deg arc of a ring, rounded cap, brand color, sweeping
// continuously. Drawn as a stroked circle whose dash covers 3/4 of the
// circumference; the whole SVG rotates via the shared spin value.
export const androidSkin: SpinnerSkin = {
  render: ({ size, color, rotate }) => {
    const strokeWidth = Math.max(2, size * 0.1);
    const r = (size - strokeWidth) / 2;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const arc = circumference * 0.75; // 270deg sweep
    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    return (
      <AnimatedSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: spin }] }}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${arc} ${circumference}`}
        />
      </AnimatedSvg>
    );
  },
};

// Web: the current Canvas look, a React Native ActivityIndicator driven by the
// same tone/size props (numeric size + token color), lifted verbatim from the
// original single-file component. It animates itself, so it ignores the shared
// rotate value.
export const webSkin: SpinnerSkin = {
  render: ({ size, color }) => <ActivityIndicator size={size} color={color} />,
};
