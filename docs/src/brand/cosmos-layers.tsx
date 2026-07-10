import { useId } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Path, Rect, G, Line, Defs, RadialGradient, LinearGradient, Stop, Mask, Filter, FeGaussianBlur, FeColorMatrix } from "react-native-svg";
import { glowColor } from "./hero-orbit";
import { SPECTRUM, CHART_ALPHA, starTint, type Star, type ShellDot, type ShellStreak, type Constellation, type NebulaBlob } from "./cosmos-sky";

// Presentational layers for the Canvas Universe. Every layer is ONE Animated.View
// wrapping a STATIC <Svg>: react-native's Animated must never wrap an Svg directly
// (its forced collapsable={false} reaches the DOM on react-native-web and React
// errors; see src/atoms/spinner/spinner.styles.tsx), and SVG element props are
// never animated. All motion is transform/opacity on the wrapper, driven by the
// JS-driver loops in cosmos.tsx.

type AnimNumber = Animated.Value | Animated.AnimatedInterpolation<number> | number;
type AnimString = Animated.AnimatedInterpolation<string> | string;

// SVG defs ids must be unique per mounted instance (multiple screens can hold a
// paused Cosmos each); React's useId is sanitized because raw ids contain colons,
// which break url(#...) references on the web.
function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

// The static backdrop sheet: the deep, unmoving far field behind the flight shells.
// One viewport-sized SVG; only the wrapper's twinkle opacity animates.
export function Starfield({
  width,
  height,
  stars,
  dark,
  alphaCap,
  opacity,
}: {
  width: number;
  height: number;
  stars: Star[];
  dark: boolean;
  alphaCap: number;
  opacity: AnimNumber;
}) {
  const base = starTint(dark);
  return (
    <Animated.View style={{ position: "absolute", top: 0, left: 0, width, height, opacity }}>
      <Svg width={width} height={height}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x * width} cy={s.y * height} r={s.r} fill={s.hue >= 0 ? SPECTRUM[s.hue] : base} fillOpacity={s.a * alphaCap} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// A flight shell: a full-field dot layer in a square box centered on the vanishing
// point, scaled outward past the camera. Scaling about the box center moves every
// dot radially away from the core: the fly-through illusion.
export function FlightShell({
  size,
  dots,
  dark,
  alphaCap,
  style,
  scale,
  opacity,
}: {
  size: number;
  dots: ShellDot[];
  dark: boolean;
  alphaCap: number;
  style: StyleProp<ViewStyle>;
  scale: AnimNumber;
  opacity: AnimNumber;
}) {
  const base = starTint(dark);
  return (
    <Animated.View style={[style, { width: size, height: size, opacity, transform: [{ scale }] }]}>
      <Svg width={size} height={size}>
        {dots.map((d, i) => (
          <Circle key={i} cx={d.x * size} cy={d.y * size} r={d.r} fill={d.hue >= 0 ? SPECTRUM[d.hue] : base} fillOpacity={d.a * alphaCap} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// A streak shell: the fastest passes render as short radial segments (round caps)
// pointing away from the vanishing point, reading as motion blur while the shell
// sweeps outward.
export function StreakShell({
  size,
  streaks,
  dark,
  alphaCap,
  style,
  scale,
  opacity,
}: {
  size: number;
  streaks: ShellStreak[];
  dark: boolean;
  alphaCap: number;
  style: StyleProp<ViewStyle>;
  scale: AnimNumber;
  opacity: AnimNumber;
}) {
  const tint = starTint(dark);
  return (
    <Animated.View style={[style, { width: size, height: size, opacity, transform: [{ scale }] }]}>
      <Svg width={size} height={size}>
        {streaks.map((s, i) => (
          <Line
            key={i}
            x1={s.x * size}
            y1={s.y * size}
            x2={(s.x + s.dx * s.len) * size}
            y2={(s.y + s.dy * s.len) * size}
            stroke={tint}
            strokeOpacity={s.a * alphaCap}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

// The chart of component constellations: dashed hairline strokes (the brand's
// dashed-orbit language) joining vertex stars, riding a gentle palindromic scale so
// the figures stay legible as distant signposts. The first vertex of each figure
// carries a quiet spectrum accent.
export function ConstellationChart({
  width,
  height,
  figures,
  dark,
  scale,
  opacity,
}: {
  width: number;
  height: number;
  figures: Constellation[];
  dark: boolean;
  scale: AnimNumber;
  opacity: AnimNumber;
}) {
  const ink = starTint(dark);
  return (
    <Animated.View style={{ position: "absolute", top: 0, left: 0, width, height, opacity, transform: [{ scale }] }}>
      <Svg width={width} height={height}>
        {figures.map((f, fi) => {
          const s = f.anchor.scale;
          const tx = f.anchor.x * width - 50 * s;
          const ty = f.anchor.y * height - 30 * s;
          return (
            <G key={f.id} transform={`translate(${tx}, ${ty}) scale(${s})`}>
              {f.strokes.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={ink}
                  strokeOpacity={dark ? CHART_ALPHA.stroke.dark : CHART_ALPHA.stroke.light}
                  strokeWidth={1}
                  strokeDasharray="4 5"
                />
              ))}
              {f.stars.map(([x, y], i) => (
                <Circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.7}
                  fill={i === 0 ? SPECTRUM[fi % SPECTRUM.length] : ink}
                  fillOpacity={dark ? CHART_ALPHA.dot.dark : CHART_ALPHA.dot.light}
                />
              ))}
            </G>
          );
        })}
      </Svg>
    </Animated.View>
  );
}

// A nebula: soft radial-gradient blobs in a fixed box (the retired GlassAurora
// technique; the gradient falloff is the softness, no filter needed), drifting
// and breathing via the wrapper transform.
export function Nebula({
  size,
  blobs,
  style,
  translateX,
  translateY,
  scale,
  opacity,
}: {
  size: number;
  blobs: NebulaBlob[];
  style: StyleProp<ViewStyle>;
  translateX: AnimNumber;
  translateY: AnimNumber;
  scale: AnimNumber;
  opacity: AnimNumber;
}) {
  const id = useSvgId("neb");
  return (
    <Animated.View style={[style, { width: size, height: size, opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>
      <Svg width={size} height={size}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" cx={b.cx * size} cy={b.cy * size} r={b.r * size}>
              <Stop offset="0" stopColor={b.c} stopOpacity={b.o} />
              <Stop offset={b.end} stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((_, i) => (
          <Rect key={i} x={0} y={0} width={size} height={size} fill={`url(#${id}-${i})`} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// The galaxy core: the brand's conic spectrum as a distant galaxy. Built exactly
// like hero-orbit's glow (a fan of thin pie sectors colored by the shared
// Catmull-Rom sweep, softened by a Gaussian blur + saturate filter), but masked
// as a solid disc that fades outward, with a bright nucleus at the center.
export function GalaxyCore({
  size,
  style,
  rotate,
  opacity,
}: {
  size: number;
  style: StyleProp<ViewStyle>;
  rotate: AnimString;
  opacity: AnimNumber;
}) {
  const id = useSvgId("gal");
  const c = size / 2;
  const n = 180;
  const sectors = Array.from({ length: n }, (_, i) => {
    const a0 = (i * 360) / n;
    const a1 = ((i + 1) * 360) / n;
    const am = a0 + 180 / n;
    const x0 = c + c * Math.sin((a0 * Math.PI) / 180);
    const y0 = c - c * Math.cos((a0 * Math.PI) / 180);
    const x1 = c + c * Math.sin((a1 * Math.PI) / 180);
    const y1 = c - c * Math.cos((a1 * Math.PI) / 180);
    return { d: `M${c} ${c} L${x0.toFixed(2)} ${y0.toFixed(2)} A${c} ${c} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`, color: glowColor(am) };
  });
  return (
    <Animated.View style={[style, { width: size, height: size, opacity, transform: [{ rotate }] }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
            <Stop offset="30%" stopColor="#ffffff" stopOpacity={0.9} />
            <Stop offset="92%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
          <Mask id={`${id}-mask`}>
            <Rect x="0" y="0" width={size} height={size} fill={`url(#${id}-fade)`} />
          </Mask>
          <Filter id={`${id}-blur`} x="-25%" y="-25%" width="150%" height="150%">
            <FeGaussianBlur stdDeviation="11" result="b" />
            <FeColorMatrix in="b" type="saturate" values="1.25" />
          </Filter>
          <RadialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <G mask={`url(#${id}-mask)`} filter={`url(#${id}-blur)`}>
          {sectors.map((s, i) => (
            <Path key={i} d={s.d} fill={s.color} />
          ))}
        </G>
        <Circle cx={c} cy={c} r={size * 0.12} fill={`url(#${id}-core)`} />
      </Svg>
    </Animated.View>
  );
}

// A comet: a thin gradient streak (bright head, fading tail) swept across the sky
// by the wrapper's animated translate; the travel angle is a static rotate.
export function Comet({
  translateX,
  translateY,
  opacity,
  angle,
}: {
  translateX: AnimNumber;
  translateY: AnimNumber;
  opacity: AnimNumber;
  angle: string;
}) {
  const id = useSvgId("comet");
  const w = 220;
  const h = 6;
  return (
    <Animated.View
      style={{ position: "absolute", top: 0, left: 0, width: w, height: h, opacity, transform: [{ translateX }, { translateY }, { rotate: angle }] }}
    >
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#27cdf2" stopOpacity={0} />
            <Stop offset="0.75" stopColor="#ffffff" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={0.95} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={h} rx={h / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}
