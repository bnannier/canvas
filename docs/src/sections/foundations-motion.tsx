import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import Animated, { Easing, useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from "react-native-reanimated";
import { Swatch, View, useReducedMotion, useTheme } from "@nannier/canvas";

// Page-only specimen motion: one UI-thread clock, no frame-by-frame React state.
// Reading copy never animates. All samples keep their authored resting appearance
// under live Reduced Motion; backgrounding the native app suspends the clock.
const MOTION = {
  cycle: 6000,
  paletteStagger: 240,
  paletteTravel: 6,
  radiusStagger: 160,
  radiusDuration: 1400,
  springPeriod: 2400,
  springTravel: 140,
} as const;
const Clock = createContext<SharedValue<number> | null>(null);
const springEase = Easing.bezier(0.34, 1.56, 0.64, 1).factory();

export function FoundationsMotion({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const clock = useSharedValue(0);
  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    "worklet";
    clock.value += timeSincePreviousFrame ?? 0;
  }, false);
  useEffect(() => {
    const update = (state: string | null) => frame.setActive(!reduced && (state == null || state === "active"));
    update(AppState.currentState);
    const subscription = AppState.addEventListener("change", update);
    return () => {
      frame.setActive(false);
      subscription.remove();
    };
  }, [frame, reduced]);
  return <Clock.Provider value={clock}>{children}</Clock.Provider>;
}

function useClock() {
  const clock = useContext(Clock);
  if (!clock) throw new Error("A Foundations specimen needs FoundationsMotion");
  return clock;
}

/** A short, soft gesture followed by a long reading pause. */
function wave(time: number, delay: number): number {
  "worklet";
  const phase = ((time - delay) % MOTION.cycle + MOTION.cycle) % MOTION.cycle;
  return phase < 1200 ? Math.sin(Math.PI * phase / 1200) ** 2 : 0;
}

/** The accent wave keeps each disc and its hue label together as one specimen. */
export function PaletteMotion({ index, children }: { index: number; children: ReactNode }) {
  const clock = useClock(), reduced = useReducedMotion();
  const motion = useAnimatedStyle(() => {
    const amount = reduced ? 0 : wave(clock.value, index * MOTION.paletteStagger);
    return { transform: [{ translateY: -MOTION.paletteTravel * amount }, { scale: 1 + 0.035 * amount }] };
  });
  return <Animated.View testID={`foundation-palette-${index}`} style={motion}>{children}</Animated.View>;
}

/** Square → authored corner → hold; captions always name the target token. */
export function RadiusMotion({ width, height = width, radius, index }: { width: number; height?: number; radius: number; index: number }) {
  const { tokens } = useTheme();
  const clock = useClock(), reduced = useReducedMotion();
  const motion = useAnimatedStyle(() => {
    const phase = ((clock.value - index * MOTION.radiusStagger) % MOTION.cycle + MOTION.cycle) % MOTION.cycle;
    // Two eased passes and a 3.2s hold make the relationship visible without
    // changing any sample's footprint or moving its token label.
    const progress = phase < MOTION.radiusDuration ? (1 + Math.cos(Math.PI * phase / MOTION.radiusDuration)) / 2
      : phase < 2 * MOTION.radiusDuration ? (1 - Math.cos(Math.PI * (phase - MOTION.radiusDuration) / MOTION.radiusDuration)) / 2 : 1;
    return { borderRadius: Math.min(radius, Math.min(width, height) / 2) * (reduced ? 1 : progress) };
  });
  return <Animated.View testID={`foundation-radius-${index}`} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
    style={[{ width, height, backgroundColor: tokens.secondary, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input }, motion]} />;
}

/** Familiar glyph gestures: a bell rings, a heart beats, a gear turns, a rocket rises. */
export function IconMotion({ name, children }: { name: string; children: ReactNode }) {
  const clock = useClock(), reduced = useReducedMotion();
  const motion = useAnimatedStyle(() => {
    const time = clock.value;
    const amount = reduced ? 0 : wave(time, name === "heart" ? 1200 : name === "rocket" ? 2400 : 0);
    const rotation = name === "bell" ? Math.sin(time / 60) * 14 * amount : name === "settings" ? 55 * amount : 0;
    return { transform: [{ rotate: `${rotation}deg` }, { scale: name === "heart" ? 1 + 0.16 * amount : 1 }, { translateY: name === "rocket" ? -6 * amount : 0 }] };
  });
  return <Animated.View testID={`foundation-icon-${name}`} style={motion}>{children}</Animated.View>;
}

/** The hand-off's 2.4s spring lane, bounded by its own measured container. */
export function SpringSample() {
  const clock = useClock(), reduced = useReducedMotion();
  const { tokens } = useTheme();
  const [width, setWidth] = useState(0);
  const motion = useAnimatedStyle(() => {
    const half = MOTION.springPeriod / 2;
    const phase = clock.value % MOTION.springPeriod;
    const progress = phase < half ? springEase(phase / half) : 1 - springEase((phase - half) / half);
    return { transform: [{ translateX: reduced ? 0 : Math.min(MOTION.springTravel, Math.max(0, width - 64)) * progress }] };
  });
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} testID="foundation-spring-lane" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
    style={{ height: 40, paddingVertical: 9, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens["surface-sunken"], overflow: "hidden" }}>
    <Animated.View testID="foundation-spring-dot" style={[{ width: 20, height: 20 }, motion]}><Swatch tiny circle bare color={tokens.primary} /></Animated.View>
  </View>;
}
