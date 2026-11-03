import { useId, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// A CSS `linear-gradient(<angle>deg, ...)` drawn with react-native-svg, so a hand-off
// gradient paints the same on the web, iOS and Android. Internal: the Card's promo modes and
// GridList's gallery thumbnails are its readers.

/** One colour stop: its colour, its place along the gradient line (0..1) and its opacity. */
export type GradientStop = { color: string; at: number; opacity?: number };

/**
 * The gradient line's endpoints for a CSS angle across a `width` by `height` box: through
 * the box's centre, in the angle's direction (0deg up, 90deg right), as long as CSS makes it
 * (the box's extent projected on that direction), so the corner stops land where a browser
 * puts them.
 */
export function gradientPoints(angle: number, width: number, height: number) {
  const w = width > 0 ? width : 1, h = height > 0 ? height : 1;
  const a = angle * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const length = Math.abs(w * dx) + Math.abs(h * Math.cos(a));
  return { x1: w / 2 - dx * length / 2, y1: h / 2 - dy * length / 2, x2: w / 2 + dx * length / 2, y2: h / 2 + dy * length / 2 };
}

const hidden = { pointerEvents: "none", "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" } as const;

/**
 * A linear gradient filling its parent, behind the parent's later children. It measures
 * itself, so the angle holds across any box; decorative, so assistive tech skips it.
 */
export function GradientFill({ angle, stops }: { angle: number; stops: readonly GradientStop[] }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; setSize((old) => old.width === width && old.height === height ? old : { width, height }); };
  const id = `gradient-${useId().replace(/:/g, "")}`;
  const points = gradientPoints(angle, size.width, size.height);
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} {...hidden}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} preserveAspectRatio="none">
        <Defs><LinearGradient id={id} gradientUnits="userSpaceOnUse" {...points}>{stops.map((stop) => <Stop key={stop.at} offset={stop.at} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />)}</LinearGradient></Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
