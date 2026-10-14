import { useId, useState } from "react";
import { Platform, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { View, useTheme } from "@nannier/canvas";
import { PAGE_LOOK, gradientLine, lookFor, orbEllipse, orbGradient } from "./page-look";

// What the SVG is handed, rounded so the server's render and the browser's agree to the
// digit (their engines differ in the last bits of Math.exp and Math.sin, and React does
// not patch a hydrated attribute): 0.01 px and an opacity step of 1e-4, a fortieth of
// one colour level.
const at = (value: number) => Math.round(value * 100) / 100;
const alphaOf = (value: number) => Math.round(value * 10000) / 10000;

// The page behind the docs shell: Dark Factory's 165 deg gradient and its two soft orbs,
// fixed to the window, static and untouchable. Docs-only scaffolding (design-language item
// 7); the values are PAGE_LOOK's (./page-look.ts).
//
// One SVG draws it the same way on the web, iOS and Android. The gradient runs along the
// CSS line for the measured size. Each orb is an elliptical radial gradient with stops read
// off the exact blurred ellipse, not a filter: react-native-svg's Android FeGaussianBlur
// caps its radius at 25 device pixels, a twentieth of the 90 and 100 px blurs the card
// names (the owner's 2026-10-13 decision).
//
// Until the layer has measured itself (the pre-rendered page and a native screen's first
// frame), it draws the seed page stretched over the window, so the static page paints the
// gradient from its first frame rather than a flat fill.
//
// The web shell mounts it behind everything (./navbar.tsx); a native screen mounts it inside
// its frame (./native-header.tsx), since the native tab and stack containers paint their own
// backgrounds under a screen. It carries the backdrop marker the e2e paint check reads its
// stops off (e2e/support/docs.ts).
export function PageBackdrop() {
  const { scheme, palette } = useTheme();
  const look = PAGE_LOOK.palettes[lookFor(scheme, palette)];
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  };
  const { width, height } = size ?? PAGE_LOOK.seed;
  const line = gradientLine(PAGE_LOOK.angle, width, height);
  return (
    <View
      {...(Platform.OS === "web" ? ({ dataSet: { pageBackdrop: "" } } as object) : null)}
      onLayout={onLayout}
      // The last stop under the drawing, as Dark Factory's shell root paints it.
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden", pointerEvents: "none", backgroundColor: look.stops[2] }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`${id}-page`} gradientUnits="userSpaceOnUse" x1={at(line.x1)} y1={at(line.y1)} x2={at(line.x2)} y2={at(line.y2)}>
            <Stop offset={0} stopColor={look.stops[0]} />
            <Stop offset={0.5} stopColor={look.stops[1]} />
            <Stop offset={1} stopColor={look.stops[2]} />
          </LinearGradient>
          {PAGE_LOOK.orbs.map((orb, i) => {
            const { a, b } = orbEllipse(orb, width, height);
            return (
              <RadialGradient key={i} id={`${id}-orb${i}`} cx="50%" cy="50%" r="50%">
                {orbGradient(a, b, orb.blur).stops.map(([offset, coverage]) => (
                  <Stop key={offset} offset={alphaOf(offset)} stopColor={look.orbs[i]} stopOpacity={alphaOf(coverage * orb.opacity)} />
                ))}
              </RadialGradient>
            );
          })}
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id}-page)`} />
        {PAGE_LOOK.orbs.map((orb, i) => {
          const { cx, cy, a, b } = orbEllipse(orb, width, height);
          const { rx, ry } = orbGradient(a, b, orb.blur);
          return <Rect key={i} x={at(cx - rx)} y={at(cy - ry)} width={at(rx * 2)} height={at(ry * 2)} fill={`url(#${id}-orb${i})`} />;
        })}
      </Svg>
    </View>
  );
}
