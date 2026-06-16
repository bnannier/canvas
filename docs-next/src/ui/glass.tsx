import { Platform, useWindowDimensions, type ViewStyle } from "react-native";
import { View, useTheme } from "@olympusoss/canvas";
import Svg, { Circle, Rect, Defs, RadialGradient, Stop } from "react-native-svg";

// Glass surface mode for the docs shell. Following the Canvas glass model, the FUNCTIONAL
// layer (navbar/sidebar/overlays) paints the translucent `popover` material in glass mode,
// while content surfaces (cards) stay solid. On the web that translucency reads as frost
// via a backdrop blur (RN Web honors the backdropFilter style); on native the translucent
// fill stands in. A soft multi-color aurora sits behind the shell so the frost has color
// to refract, matching the Vite docs' glass body wash.

// The web-only backdrop blur applied to a glass bar. Typed loosely because backdropFilter
// is a web CSS property react-native-web passes through but RN's ViewStyle does not model.
export function webFrost(glass: boolean): ViewStyle {
  if (Platform.OS !== "web" || !glass) return {};
  return { backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" } as unknown as ViewStyle;
}

// The aurora blob positions; the lead color is keyed off the primary token, the rest are
// the brand orbs. Light mode boosts the opacities and adds an off-white cool floor so the
// frost has color to transmit (matching the Vite `:not(.dark)` aurora override); dark mode
// keeps the wash subtle over the deep background.
const BLOBS = (primary: string) => [
  { c: primary, cx: "16%", cy: "10%" },
  { c: "#8b5cf6", cx: "86%", cy: "6%" },
  { c: "#06b6d4", cx: "72%", cy: "78%" },
  { c: "#ff6a4d", cx: "22%", cy: "88%" },
];

// The full-bleed aurora wash rendered behind the shell when glass is on.
export function GlassAurora() {
  const { width, height } = useWindowDimensions();
  const { tokens, dark } = useTheme();
  const r = Math.max(width, height);
  const blobs = BLOBS(tokens.primary);
  // Light glass needs a far stronger, warmer wash than dark to read through the frost.
  const o = dark ? [0.22, 0.2, 0.16, 0.12] : [0.36, 0.32, 0.3, 0.22];
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`ga-${i}`} cx={b.cx} cy={b.cy} r="52%">
              <Stop offset="0%" stopColor={b.c} stopOpacity={o[i]} />
              <Stop offset="70%" stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {/* Off-white cool floor in light mode, so the bands sit on a tinted base. */}
        {!dark ? <Rect x="0" y="0" width="100%" height="100%" fill="#fafaff" /> : null}
        {blobs.map((_, i) => (
          <Circle key={i} cx={width / 2} cy={height / 2} r={r} fill={`url(#ga-${i})`} />
        ))}
      </Svg>
    </View>
  );
}
