import { useWindowDimensions, type ViewStyle } from "react-native";
import { View, useTheme } from "@olympusoss/canvas";
import Svg, { Rect, Defs, RadialGradient, Stop } from "react-native-svg";

// Glass surface mode for the docs shell. The shell (topbar, sidebar, drawer, search)
// now renders through the kit's GlassSurface, which paints native Liquid Glass on iOS
// and an expo-blur frost on web/Android. This module only supplies the soft multi-color
// aurora that sits behind the shell so the frost has color to refract, matching the
// previous web docs' glass body wash.

// The aurora blobs, mirroring the Vite `[data-surface="glass"] body` radial-gradient stack:
// three corner blobs (primary top-left, brand violet top-right, brand cyan bottom-right) over
// an off-white floor in light. Each blob is positioned as a fraction of the viewport (cx/cy)
// with a radius in rem (Vite uses 38-42rem in dark, 48-56rem in light), and fades to clear at
// `end`. Light carries far stronger, warmer alphas than dark so it reads through the frost;
// dark stays restrained over the deep background (Vite leaves the dark wash bare).
const REM = 16;
const BLOBS = (primary: string, dark: boolean) => [
  { c: primary, cx: 0.12, cy: 0.06, rem: dark ? 38 : 52, o: dark ? 0.18 : 0.3, end: 0.6 },
  { c: "#8b5cf6", cx: 0.9, cy: 0.12, rem: dark ? 34 : 48, o: dark ? 0.18 : 0.38, end: 0.62 },
  { c: "#06b6d4", cx: 0.78, cy: 0.94, rem: dark ? 42 : 56, o: dark ? 0.18 : 0.36, end: dark ? 0.62 : 0.64 },
];

// The full-bleed aurora wash rendered behind the shell when glass is on. Each blob fills the
// viewport with a userSpaceOnUse radial gradient anchored at its viewport fraction, so the
// corners land exactly where the Vite CSS `radial-gradient(... at X% Y%)` puts them (the prior
// objectBoundingBox circles pushed the centers off-screen and washed the wash out).
export function GlassAurora() {
  const { width, height } = useWindowDimensions();
  const { tokens, dark } = useTheme();
  const blobs = BLOBS(tokens.primary, dark);
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`ga-${i}`} gradientUnits="userSpaceOnUse" cx={b.cx * width} cy={b.cy * height} r={b.rem * REM}>
              <Stop offset="0" stopColor={b.c} stopOpacity={b.o} />
              <Stop offset={b.end} stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {/* Off-white cool floor in light mode, so the bands sit on a tinted base (Vite floor radial). */}
        {!dark ? <Rect x={0} y={0} width={width} height={height} fill="#fafaff" /> : null}
        {blobs.map((_, i) => (
          <Rect key={i} x={0} y={0} width={width} height={height} fill={`url(#ga-${i})`} />
        ))}
      </Svg>
    </View>
  );
}
