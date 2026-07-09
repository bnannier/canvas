import { useWindowDimensions, type ViewStyle } from "react-native";
import { View, useTheme } from "@olympusoss/canvas";
import Svg, { Rect, Defs, RadialGradient, Stop } from "react-native-svg";

// Glass surface mode for the docs shell. The shell (topbar, sidebar, drawer, search)
// now renders through the kit's GlassSurface, which paints native Liquid Glass on iOS
// and an expo-blur frost on web/Android. This module only supplies the soft multi-color
// aurora that sits behind the shell so the frost has color to refract.

// The aurora blobs, a radial-gradient stack positioned as viewport fractions (cx/cy) with a
// radius in rem, each fading to clear at `end`. Light carries stronger alphas than dark so it
// reads through the frost; dark stays more restrained over the deep background.
//
// Two palettes. The default three-blob wash (primary top-left / violet top-right / cyan
// bottom-right) sits quietly behind the shell. The `vivid` wash adds two hues (magenta
// mid-right, teal bottom-right) and raises every alpha, dark the most since it was faintest;
// it's for places where the aurora IS the backdrop and should be colorful (the iOS search
// session). Its bottom-spread cyan + teal land right behind the search bubble, so the clear
// Liquid Glass refracts real color.
const REM = 16;
const BLOBS = (primary: string, dark: boolean, vivid: boolean) =>
  vivid
    ? [
        { c: primary, cx: 0.1, cy: 0.04, rem: dark ? 40 : 54, o: dark ? 0.3 : 0.42, end: 0.6 },
        { c: "#8b5cf6", cx: 0.92, cy: 0.06, rem: dark ? 38 : 50, o: dark ? 0.34 : 0.48, end: 0.62 },
        { c: "#ec4899", cx: 0.97, cy: 0.46, rem: dark ? 34 : 46, o: dark ? 0.24 : 0.38, end: 0.6 },
        { c: "#06b6d4", cx: 0.06, cy: 0.72, rem: dark ? 40 : 52, o: dark ? 0.28 : 0.42, end: 0.62 },
        { c: "#14b8a6", cx: 0.82, cy: 0.97, rem: dark ? 44 : 58, o: dark ? 0.3 : 0.44, end: dark ? 0.64 : 0.66 },
      ]
    : [
        { c: primary, cx: 0.12, cy: 0.06, rem: dark ? 38 : 52, o: dark ? 0.18 : 0.3, end: 0.6 },
        { c: "#8b5cf6", cx: 0.9, cy: 0.12, rem: dark ? 34 : 48, o: dark ? 0.18 : 0.38, end: 0.62 },
        { c: "#06b6d4", cx: 0.78, cy: 0.94, rem: dark ? 42 : 56, o: dark ? 0.18 : 0.36, end: dark ? 0.62 : 0.64 },
      ];

// The full-bleed aurora wash rendered behind the shell when glass is on. Each blob fills the
// viewport with a userSpaceOnUse radial gradient anchored at its viewport fraction, so the
// corners land exactly where a `radial-gradient(... at X% Y%)` puts them (the prior
// objectBoundingBox circles pushed the centers off-screen and washed the wash out).
export function GlassAurora({ vivid = false }: { vivid?: boolean } = {}) {
  const { width, height } = useWindowDimensions();
  const { tokens, dark } = useTheme();
  const blobs = BLOBS(tokens.primary, dark, vivid);
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      <Svg width={width} height={height}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`ga-${i}`} gradientUnits="userSpaceOnUse" cx={b.cx * width} cy={b.cy * height} r={b.rem * REM}>
              <Stop offset="0" stopColor={b.c} stopOpacity={b.o} />
              <Stop offset={b.end} stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {/* Off-white cool floor in light mode, so the bands sit on a tinted base. */}
        {!dark ? <Rect x={0} y={0} width={width} height={height} fill="#fafaff" /> : null}
        {blobs.map((_, i) => (
          <Rect key={i} x={0} y={0} width={width} height={height} fill={`url(#ga-${i})`} />
        ))}
      </Svg>
    </View>
  );
}
