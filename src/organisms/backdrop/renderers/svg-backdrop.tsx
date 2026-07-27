import { useId, Fragment } from "react";
import { Animated } from "react-native";
import Svg, { Circle, Path, Rect, G, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import { View } from "../../../style/index.js";
import { type BackdropClock } from "../backdrop-clock.js";
import { type Layer, type Particle, type ParticleSprite, type GradientBlob } from "../backdrop-layers.js";

// The Backdrop's baseline renderer, built on react-native-svg (a required kit peer),
// so it runs anywhere the kit runs with no optional dependency at all.
//
// It does four jobs at once, which is why it stays in the tree even once a GPU
// renderer exists: the no-dependency baseline, the loading window while a GPU
// backend boots, the Reduce Motion poster host, and the recovery path if a GPU
// renderer fails to initialise.
//
// Architectural rule, load-bearing: every layer is ONE Animated.View wrapping a
// STATIC <Svg>. Animated must never wrap an Svg directly, because its forced
// collapsable={false} reaches the DOM on react-native-web and React throws (see
// src/atoms/spinner/spinner.styles.tsx). No SVG element prop is ever animated;
// all motion is transform and opacity on the wrapper.

type AnimNumber = Animated.Value | Animated.AnimatedInterpolation<number> | number;
type Interp = Animated.Value | Animated.AnimatedInterpolation<number>;

// SVG defs ids must be unique per mounted instance; React's useId is sanitized
// because raw ids contain colons, which break url(#...) references on the web.
function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

// A true exponential z-curve sampled into keyframes. The original hand-picked
// five-point approximation drifted from constant z-velocity at the wrap seam,
// which is exactly where the eye is most likely to catch it; sampling exp()
// finely removes that.
const Z_STEPS = 12;
function zCurve(depth: number): { inputRange: number[]; outputRange: number[] } {
  const s0 = Math.max(0.05, 1 - 0.65 * depth);
  const s1 = 1 + 1.4 * depth;
  const inputRange: number[] = [];
  const outputRange: number[] = [];
  for (let i = 0; i <= Z_STEPS; i++) {
    const t = i / Z_STEPS;
    inputRange.push(t);
    outputRange.push(s0 * Math.pow(s1 / s0, t));
  }
  return { inputRange, outputRange };
}

const FADE_IN = [0, 0.12, 0.78, 0.95, 1];

// Layer phase (flight + offset) mod 1 as a chained interpolation; the epsilon step
// avoids a degenerate zero-width segment at the seam.
function sawtooth(flight: Animated.Value, offset: number): Interp {
  if (offset === 0) return flight;
  const seam = 1 - offset;
  return flight.interpolate({
    inputRange: [0, seam, seam + 1e-6, 1],
    outputRange: [offset, 1, 0, offset],
  });
}

// ---------------------------------------------------------------------------
// Sprites.
// ---------------------------------------------------------------------------

// A four-point diffraction glint: two crossed tapering diamonds, the classic
// astrophotography starburst, drawn as one path.
function sparkPath(r: number, w: number): string {
  return `M 0 ${-r} L ${w} 0 L 0 ${r} L ${-w} 0 Z M ${-r} 0 L 0 ${-w} L ${r} 0 L 0 ${w} Z`;
}

/** Draw one body. `bw`/`bh` are the layer box in px, so unit positions resolve
 *  correctly whether the box is a square travel shell or the raw viewport. */
function drawParticle(p: Particle, i: number, bw: number, bh: number, sprite: ParticleSprite, tint: string, cap: number, haloId: string) {
  const color = p.color ?? tint;
  const cx = p.x * bw;
  const cy = p.y * bh;
  const o = p.a * cap;

  if (sprite === "streak") {
    const dx = p.dx ?? 0;
    const dy = p.dy ?? 0;
    const len = p.len ?? 0.02;
    return (
      <Line
        key={i}
        x1={cx}
        y1={cy}
        x2={(p.x + dx * len) * bw}
        y2={(p.y + dy * len) * bh}
        stroke={color}
        strokeOpacity={o}
        strokeWidth={Math.max(1, p.r)}
        strokeLinecap="round"
      />
    );
  }

  if (sprite === "spark") {
    const w = Math.max(0.9, p.r * 0.11);
    return (
      <G key={i} transform={`translate(${cx}, ${cy}) rotate(${p.rot ?? 0})`}>
        <Path d={sparkPath(p.r, w)} fill={color} fillOpacity={o} />
        <Circle cx={0} cy={0} r={Math.max(1, p.r * 0.09)} fill="#ffffff" fillOpacity={Math.min(1, o * 1.3)} />
      </G>
    );
  }

  if (sprite === "halo") {
    // Baked bloom: a soft wide falloff under a hard core. Two nodes instead of a
    // filter, so it costs nothing on the native backends that lack real blur.
    // The halo is kept tight and faint on purpose: bloom that reads as glow on one
    // body reads as haze when a few hundred of them overlap behind body text.
    return (
      <Fragment key={i}>
        <Circle cx={cx} cy={cy} r={p.r * 2.8} fill={`url(#${haloId})`} fillOpacity={o * 0.3} />
        <Circle cx={cx} cy={cy} r={p.r} fill={color} fillOpacity={o} />
      </Fragment>
    );
  }

  return <Circle key={i} cx={cx} cy={cy} r={p.r} fill={color} fillOpacity={o} />;
}

// ---------------------------------------------------------------------------
// Layer views.
// ---------------------------------------------------------------------------

interface ParticlesLayerViewProps {
  field: Particle[];
  sprite: ParticleSprite;
  width: number;
  height: number;
  tint: string;
  bloom: boolean;
  style: object;
  /** Omitted for a pinned layer, which never travels. */
  scale?: Interp;
  opacity: AnimNumber;
}

function ParticlesLayerView({ field, sprite, width, height, tint, bloom, style, scale, opacity }: ParticlesLayerViewProps) {
  const haloId = useSvgId("halo");
  const needsHalo = sprite === "halo" || bloom;
  return (
    <Animated.View style={[style, { width, height, opacity, ...(scale ? { transform: [{ scale }] } : null) }]}>
      <Svg width={width} height={height}>
        {needsHalo ? (
          <Defs>
            <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={tint} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={tint} stopOpacity={0} />
            </RadialGradient>
          </Defs>
        ) : null}
        {field.map((p, i) => drawParticle(p, i, width, height, sprite, tint, 1, haloId))}
      </Svg>
    </Animated.View>
  );
}

interface GradientLayerViewProps {
  blobs: GradientBlob[];
  size: number;
  style: object;
  scale: AnimNumber;
  opacity: AnimNumber;
}

function GradientLayerView({ blobs, size, style, scale, opacity }: GradientLayerViewProps) {
  const id = useSvgId("grad");
  return (
    <Animated.View style={[style, { width: size, height: size, opacity, transform: [{ scale }] }]}>
      <Svg width={size} height={size}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" cx={b.cx * size} cy={b.cy * size} r={b.r * size}>
              <Stop offset="0" stopColor={b.color} stopOpacity={b.o} />
              <Stop offset={b.end} stopColor={b.color} stopOpacity={0} />
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

// ---------------------------------------------------------------------------
// The renderer.
// ---------------------------------------------------------------------------

export interface SvgBackdropProps {
  layers: Layer[];
  width: number;
  height: number;
  focus: { x: number; y: number };
  clock: BackdropClock;
  tint: string;
  /** Global alpha cap from the prominence axis, multiplied into every layer. */
  prominence: number;
}

export function SvgBackdrop({ layers, width, height, focus, clock, tint, prominence }: SvgBackdropProps) {
  const focusX = width * focus.x;
  const focusY = height * focus.y;

  // Travelling layers live in square boxes centred on the focus point, sized to
  // cover the farthest viewport corner at scale 1. React Native scales about the
  // view centre, so this centres the radial motion exactly on the vanishing point.
  const box = Math.ceil(2 * Math.hypot(0.5 * width, 0.58 * height));
  const boxStyle = { position: "absolute" as const, left: focusX - box / 2, top: focusY - box / 2 };
  const pinnedStyle = { position: "absolute" as const, top: 0, left: 0 };

  const shimmer = clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  return (
    <>
      {layers.map((layer, i) => {
        if (layer.kind === "shader") {
          // No shader support here; the scene's mandatory fallback stands in.
          return <Fragment key={i}>{layer.fallback}</Fragment>;
        }

        if (layer.kind === "custom") {
          return <Fragment key={i}>{layer.content}</Fragment>;
        }

        if (layer.kind === "gradient") {
          const size = layer.size;
          const style = {
            position: "absolute" as const,
            left: width * layer.at.x - size / 2,
            top: height * layer.at.y - size / 2,
          };
          // Palindromic keyframes (equal endpoints) keep a drifting layer seam-free
          // on the looping master value.
          const swell = 0.18 * Math.max(0.2, layer.depth);
          const scale: AnimNumber = layer.drift
            ? clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1 - swell, 1 + swell, 1 - swell] })
            : 1;
          const cap = layer.alpha * prominence;
          const opacity = clock.flight.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.7 * cap, cap, 0.7 * cap],
          });
          return <GradientLayerView key={i} blobs={layer.blobs} size={size} style={style} scale={scale} opacity={opacity} />;
        }

        const cap = layer.alpha * prominence;

        // A pinned layer does not travel: it is the deep field behind everything,
        // sized to the viewport and breathing only on the shimmer channel.
        if (layer.depth === 0) {
          const opacity: AnimNumber = layer.twinkle ? Animated.multiply(shimmer, cap) : cap;
          return (
            <ParticlesLayerView
              key={i}
              field={layer.field}
              sprite={layer.sprite}
              width={width}
              height={height}
              tint={layer.tint ?? tint}
              bloom={layer.bloom}
              style={pinnedStyle}
              opacity={opacity}
            />
          );
        }

        const phase = sawtooth(clock.flight, layer.phase);
        const scale = phase.interpolate(zCurve(layer.depth));
        const fade = phase.interpolate({ inputRange: FADE_IN, outputRange: [0, cap, cap, 0, 0] });
        const opacity: AnimNumber = layer.twinkle
          ? Animated.multiply(fade, clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }))
          : fade;

        return (
          <ParticlesLayerView
            key={i}
            field={layer.field}
            sprite={layer.sprite}
            width={box}
            height={box}
            tint={layer.tint ?? tint}
            bloom={layer.bloom}
            style={boxStyle}
            scale={scale}
            opacity={opacity}
          />
        );
      })}
    </>
  );
}

/** A flat scheme floor painted beneath every layer. Light schemes need one;
 *  dark rides the theme background token directly. */
export function BackdropFloor({ color }: { color: string }) {
  return <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color }} />;
}
