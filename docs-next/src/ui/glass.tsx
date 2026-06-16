import { Platform, useWindowDimensions, type ViewStyle } from "react-native";
import { View } from "@olympusoss/canvas";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

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

const BLOBS = [
  { c: "#6366f1", cx: "16%", cy: "10%", o: 0.22 },
  { c: "#8b5cf6", cx: "86%", cy: "6%", o: 0.2 },
  { c: "#06b6d4", cx: "72%", cy: "78%", o: 0.16 },
  { c: "#ff6a4d", cx: "22%", cy: "88%", o: 0.12 },
];

// The full-bleed aurora wash rendered behind the shell when glass is on.
export function GlassAurora() {
  const { width, height } = useWindowDimensions();
  const r = Math.max(width, height);
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        <Defs>
          {BLOBS.map((b, i) => (
            <RadialGradient key={i} id={`ga-${i}`} cx={b.cx} cy={b.cy} r="48%">
              <Stop offset="0%" stopColor={b.c} stopOpacity={b.o} />
              <Stop offset="70%" stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {BLOBS.map((_, i) => (
          <Circle key={i} cx={width / 2} cy={height / 2} r={r} fill={`url(#ga-${i})`} />
        ))}
      </Svg>
    </View>
  );
}
