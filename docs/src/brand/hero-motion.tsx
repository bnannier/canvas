import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, type ViewStyle } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { View, useReducedMotion, useTheme } from "@nannier/canvas";
import { HERO_MOTION } from "./library-hero-look";

// RNW compiles these into the server document, just as the kit's LoopView does.
// The entrance can finish while JavaScript downloads, without hiding the headline
// again on hydration. Native keeps the same curve on its animation driver.
const entrance = Platform.select({ web: StyleSheet.create({ rise: {
  // A nonzero first frame lets the browser register the text's initial paint.
  // Exactly zero makes a compositor-only reveal wait for hydration's text repaint
  // in paint timing, even though the entrance is already visible without JS.
  animationKeyframes: { from: { opacity: 0.01, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0px)" } },
  animationDuration: `${HERO_MOTION.rise}ms`,
  animationTimingFunction: `cubic-bezier(${HERO_MOTION.entrance.join(",")})`,
  animationIterationCount: 1,
  animationFillMode: "both",
} as unknown as ViewStyle }).rise });

function CompositorHeroEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  // Keep the compiled StyleSheet object intact. Reanimated flattens it and loses
  // RNW's keyframe class, so this host is the same plain kit View as LoopView.
  return <View testID="library-entrance" style={[{ flex: 1, minWidth: 0, justifyContent: "center" }, !reduced ? entrance : null]}>{children}</View>;
}

function NativeHeroEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = reduced ? 1 : withTiming(1, { duration: HERO_MOTION.rise, easing: Easing.bezier(...HERO_MOTION.entrance) });
    return () => cancelAnimation(progress);
  }, [progress, reduced]);
  const motion = useAnimatedStyle(() => ({ opacity: reduced ? 1 : progress.value, transform: [{ translateY: reduced ? 0 : 16 * (1 - progress.value) }] }));
  return <Animated.View testID="library-entrance" style={[{ flex: 1, minWidth: 0, justifyContent: "center" }, motion]}>{children}</Animated.View>;
}

/** The same reference rise on the browser compositor and the native animation driver. */
export const HeroEntrance = entrance ? CompositorHeroEntrance : NativeHeroEntrance;

/** The 8 px ion dot and its 10 px expanding halo, as the hand-off's pulse keyframes. */
export function HeroPulse() {
  const { tokens } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = reduced ? 0 : withRepeat(withSequence(
      withTiming(1, { duration: HERO_MOTION.pulse * 0.7, easing: Easing.bezier(0, 0, 0.58, 1) }),
      withTiming(1, { duration: HERO_MOTION.pulse * 0.3 }),
      withTiming(0, { duration: 0 }),
    ), -1);
    return () => cancelAnimation(pulse);
  }, [pulse, reduced]);
  const halo = useAnimatedStyle(() => ({ opacity: reduced ? 0 : 1 - pulse.value, transform: [{ scale: 1 + pulse.value * 2.5 }] }));
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 8, height: 8 }}>
    <Animated.View style={[{ position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.ring }, halo]} />
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.primary }} />
  </View>;
}
