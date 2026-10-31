import { useEffect, type ReactNode } from "react";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { View, useReducedMotion, useTheme } from "@nannier/canvas";
import { HERO_MOTION } from "./library-hero-look";

/** The reference's 16 px rise, with no frame-by-frame React state. */
export function HeroEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = reduced ? 1 : withTiming(1, { duration: HERO_MOTION.rise, easing: Easing.bezier(...HERO_MOTION.entrance) });
    return () => cancelAnimation(progress);
  }, [progress, reduced]);
  const motion = useAnimatedStyle(() => ({ opacity: reduced ? 1 : progress.value, transform: [{ translateY: reduced ? 0 : 16 * (1 - progress.value) }] }));
  return <Animated.View style={[{ flex: 1, minWidth: 0, justifyContent: "center" }, motion]}>{children}</Animated.View>;
}

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
