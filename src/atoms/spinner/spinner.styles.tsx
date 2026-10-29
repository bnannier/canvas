import { useEffect } from "react";
import { Animated, type TextStyle } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { LoopView, createLoopChannel, alpha, type ColorTokens } from "../../style/index.js";
import { type SpinnerSkin } from "./spinner.shared.js";

// Co-located Spinner skins, one per platform, as the Canvas v4 hand-off draws them
// (`K.def('spinner')` in tools/v4/handoff/cv-kit-overlays.js and its `K.PF` rows in
// cv-kit-platform.js). The color is a semantic token on every platform (the accent by
// default), and only the native SHAPE of the loader changes per OS:
//   iOS (UIActivityIndicatorView): 8 short rounded SPOKES around the center, each fading
//     11% further than the one before, the whole ring rotating. 14 / 20 / 32 pt.
//   Android (M3 CircularProgressIndicator, indeterminate): a SINGLE ARC, 30% of a ring
//     with a rounded cap at a stroke of an eighth of the diameter (2.5dp at least),
//     rotating. 16 / 24 / 40 dp.
//   Web: a ring whose rest is the color at 22% and whose top quarter is the solid color,
//     an eighth of the diameter thick (2px at least), rotating. 14 / 20 / 32 px.
// The label beside (or under) the indicator is 500 14 in the foreground, the description
// 400 12 in the subtle ink, 10px from the indicator.

export type Tone = "primary" | "muted" | "foreground";

// Arc/spoke color token per tone: reads from the active brand tokens (via
// useTheme) so it follows light/dark and the glass surface.
export const TONE_TOKEN = {
  primary: "primary",
  muted: "subtle-foreground",
  foreground: "foreground",
} satisfies Record<Tone, keyof ColorTokens>;

// The component-owned label + description type, shared across platforms (brand type,
// not a platform face) so the pairing reads identically on iOS, Android, and web.
function label(tokens: ColorTokens): TextStyle {
  return { color: tokens.foreground, fontSize: 14, lineHeight: 18, fontWeight: "500" };
}
function description(tokens: ColorTokens): TextStyle {
  return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"], fontSize: 12, lineHeight: 17.4, fontWeight: "400" };
}

// react-native-svg's shapes aren't Animated components. Each natively spinning skin wraps
// a static Svg in an Animated.View whose transform interpolates the shared 0..1 value to
// 0..360deg; rotating that centered square spins the shape. (Animating the Svg itself
// would put Animated's `collapsable={false}` on the web `<svg>`, which React rejects.)

// iOS: 8 spokes every 45deg, each a rounded bar from the rim inward, the leading spoke
// solid and each one behind it 11% fainter. The whole SVG rotates via the shared value.
const SPOKES = 8;

export const iosSkin: SpinnerSkin = {
  sizes: { small: 14, base: 20, large: 32 },
  render: ({ size, color, rotate }) => {
    const w = Math.max(2, Math.round(size * 0.11));
    const l = Math.round(size * 0.28);
    const c = size / 2;
    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {Array.from({ length: SPOKES }, (_, i) => (
            <Rect
              key={i}
              x={c - w / 2}
              y={0}
              width={w}
              height={l}
              rx={9999}
              fill={color}
              opacity={1 - i * 0.11}
              transform={`rotate(${-i * 45} ${c} ${c})`}
            />
          ))}
        </Svg>
      </Animated.View>
    );
  },
  label,
  description,
};

// Android (M3): 30% of a ring, rounded cap, sweeping. Drawn as a stroked circle whose dash
// covers 0.3 of the circumference; the whole SVG rotates via the shared value.
export const androidSkin: SpinnerSkin = {
  sizes: { small: 16, base: 24, large: 40 },
  render: ({ size, color, rotate }) => {
    const strokeWidth = Math.max(2.5, size / 8);
    const r = (size - strokeWidth) / 2;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
          />
        </Svg>
      </Animated.View>
    );
  },
  label,
  description,
};

// Web: the ring rotates on the loop primitive (src/style/loop.tsx), a compositor CSS
// animation, so nothing commits through React per frame. One channel turns every web
// spinner on the page, once per 900 ms (the shell's period), and runs only while one is
// mounted.
const ring = createLoopChannel({ period: 900 });
const TURN = { channel: ring, inputRange: [0, 1], outputRange: [0, 360] };
let turning = 0;

function WebRing({ size, color }: { size: number; color: string }) {
  useEffect(() => {
    if (turning++ === 0) ring.play();
    return () => {
      if (--turning === 0) ring.stop();
    };
  }, []);
  const width = Math.max(2, size / 8);
  return (
    <LoopView
      rotate={TURN}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        borderWidth: width,
        borderColor: alpha(color, 0.22),
        borderTopColor: color,
      }}
    />
  );
}

export const webSkin: SpinnerSkin = {
  // The ring turns on its own loop channel, so the shell drives no Animated loop for it.
  spins: false,
  sizes: { small: 14, base: 20, large: 32 },
  render: ({ size, color }) => <WebRing size={size} color={color} />,
  label,
  description,
};
